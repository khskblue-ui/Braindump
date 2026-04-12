import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { isAllowedImageUrl } from '@/lib/url-validation';
import { classifyText, classifyImage, smartTruncate } from '@/lib/classify';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const MAX_BATCH = 50;
const MAX_TEXT_LENGTH = 10000;
const CONCURRENCY = 4; // Parallel AI calls

// Fetch user's custom classify rules and format as prompt string
async function fetchUserRules(supabase: SupabaseClient, userId: string): Promise<string | undefined> {
  const { data: rules } = await supabase
    .from('user_classify_rules')
    .select('keyword, category, context')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!rules?.length) return undefined;
  return rules.map((r: { keyword: string; category: string; context: string | null }) => {
    const ctxDirective = r.context
      ? `, context를 반드시 "${r.context}"로 설정`
      : '';
    return `- "${r.keyword}" 키워드 → 반드시 ${r.category} 포함${ctxDirective}`;
  }).join('\n');
}

// PATCH: 미분류(inbox) 항목 일괄 재분류 — 병렬 처리 (동시성 제한)
export async function PATCH() {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { data: inboxEntries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .contains('categories', ['inbox'])
    .order('created_at', { ascending: false });

  if (error || !inboxEntries?.length) {
    return NextResponse.json({ reclassified: 0, total: 0 });
  }

  const limited = inboxEntries.slice(0, MAX_BATCH);

  // Fetch user correction patterns once for all entries (personalization)
  const { data: patterns } = await supabase
    .from('user_classify_patterns')
    .select('original_categories,corrected_categories,original_tags,corrected_tags,keyword_context')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const userPatterns = patterns?.length ? patterns.map((p: {
    original_categories: string[] | null;
    corrected_categories: string[] | null;
    original_tags: string[] | null;
    corrected_tags: string[] | null;
    keyword_context: string | null;
  }) => {
    const parts: string[] = [];
    if (p.original_categories && p.corrected_categories) {
      parts.push(`"${p.keyword_context?.slice(0, 50) || '...'}" → 카테고리: ${p.original_categories.join(',')} → ${p.corrected_categories.join(',')}`);
    }
    if (p.original_tags && p.corrected_tags) {
      parts.push(`태그: [${p.original_tags.join(',')}] → [${p.corrected_tags.join(',')}]`);
    }
    return parts.join('; ');
  }).filter(Boolean).join('\n') : undefined;

  // Fetch user's custom rules
  const userRules = await fetchUserRules(supabase, user.id);

  // Process in parallel with concurrency limit
  const results: Array<{ id: string; category: string; error?: string }> = [];
  let reclassified = 0;

  // Chunk into groups of CONCURRENCY
  for (let i = 0; i < limited.length; i += CONCURRENCY) {
    const chunk = limited.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.allSettled(
      chunk.map((entry) => classifySingleEntry(entry, supabase, user, userPatterns, userRules))
    );

    for (let j = 0; j < chunkResults.length; j++) {
      const settled = chunkResults[j];
      const entry = chunk[j];
      if (settled.status === 'fulfilled' && settled.value) {
        reclassified++;
        results.push({ id: entry.id, category: settled.value });
      } else {
        const errMsg = settled.status === 'rejected' ? String(settled.reason) : '분류 실패';
        results.push({ id: entry.id, category: 'inbox', error: errMsg });
      }
    }
  }

  return NextResponse.json({ reclassified, total: inboxEntries.length, results });
}

// Core classification logic shared by both PATCH (batch) and POST (single) handlers.
// Returns the ClassifyResult on success, or null if there's nothing to classify.
async function classifyEntryCore(
  entry: { raw_text?: string | null; image_url?: string | null; extracted_text?: string | null; input_type?: string | null },
  userPatterns?: string,
  userRules?: string
): Promise<import('@/types').ClassifyResult | null> {
  const rawText = (entry.raw_text as string) || '';
  const imageUrl = entry.image_url as string | null;
  const existingExtractedText = (entry.extracted_text as string) || '';
  const inputType = (entry.input_type as string) || 'text';

  let result;

  if (imageUrl && (inputType === 'image' || inputType === 'mixed')) {
    // Try image-based classification first
    let imageFetchOk = false;
    if (isAllowedImageUrl(imageUrl)) {
      try {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          imageFetchOk = true;
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64 = Buffer.from(imageBuffer).toString('base64');
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          result = await classifyImage(
            base64,
            contentType as 'image/jpeg' | 'image/png' | 'image/webp',
            rawText ? rawText.slice(0, MAX_TEXT_LENGTH) : undefined,
            { userPatterns, userRules }
          );
        }
      } catch {
        // Image fetch failed (network error, timeout, etc.)
      }
    }

    // Collect all available text for fallback
    const fallbackText = [rawText, existingExtractedText, result?.extracted_text]
      .filter(Boolean).join('\n\n');

    if (!imageFetchOk && fallbackText) {
      // Image URL expired/invalid — fall back to text classification
      result = await classifyText(
        smartTruncate(fallbackText, MAX_TEXT_LENGTH),
        { userPatterns, userRules, inputType: 'image', textLength: fallbackText.length }
      );
    } else if (
      result &&
      result.categories.length === 1 &&
      result.categories[0] === 'inbox' &&
      fallbackText
    ) {
      // Image classified as inbox despite having text — try text classification as 2nd attempt
      const imageExtractedText = result.extracted_text;
      const textResult = await classifyText(
        smartTruncate(fallbackText, MAX_TEXT_LENGTH),
        { userPatterns, userRules, inputType: 'image', textLength: fallbackText.length }
      );
      if (textResult.categories[0] !== 'inbox') {
        result = textResult;
        if (imageExtractedText) result.extracted_text = imageExtractedText;
      }
    }

    if (!result) return null;
  } else {
    const textToClassify = [rawText, existingExtractedText].filter(Boolean).join('\n\n');
    if (!textToClassify) return null;
    result = await classifyText(smartTruncate(textToClassify, MAX_TEXT_LENGTH), { userPatterns, userRules, inputType, textLength: textToClassify.length });
  }

  return result;
}

// Build DB update payload from a ClassifyResult
function buildUpdateData(result: import('@/types').ClassifyResult, inputType: string): Record<string, unknown> {
  const topic =
    result.categories.includes('knowledge') && result.topic
      ? result.topic.trim().toLowerCase()
      : null;

  const updateData: Record<string, unknown> = {
    categories: result.categories,
    tags: result.tags,
    summary: result.summary || null,
    ai_metadata: result,
  };
  // Only update extracted_text for image entries where the AI provides OCR.
  // For PDF/text entries, on-device extraction already stored the full text — don't overwrite.
  if (result.extracted_text && (inputType === 'image' || inputType === 'mixed')) {
    updateData.extracted_text = result.extracted_text;
  }
  if (topic) updateData.topic = topic;
  if (result.due_date) updateData.due_date = result.due_date;
  updateData.context = result.context ?? null;

  return updateData;
}

// Helper: classify + update a single entry, returns category on success
async function classifySingleEntry(
  entry: Record<string, unknown>,
  supabase: SupabaseClient,
  user: User,
  userPatterns?: string,
  userRules?: string
): Promise<string | null> {
  const result = await classifyEntryCore(entry, userPatterns, userRules);
  if (!result) return null;

  const updateData = buildUpdateData(result, (entry.input_type as string) || 'text');

  const { error: updateError } = await supabase
    .from('entries')
    .update(updateData)
    .eq('id', entry.id as string)
    .eq('user_id', user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return result.categories[0];
}

// POST: 단건 분류
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { entry_id } = await request.json();
  if (!entry_id) {
    return NextResponse.json({ error: 'entry_id가 필요합니다.' }, { status: 400 });
  }

  const { data: entry, error: fetchError } = await supabase
    .from('entries')
    .select('*')
    .eq('id', entry_id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !entry) {
    return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
  }

  // Fetch user's recent correction patterns (last 20)
  const { data: patterns } = await supabase
    .from('user_classify_patterns')
    .select('original_categories,corrected_categories,original_tags,corrected_tags,keyword_context')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const userPatterns = patterns?.length ? patterns.map((p: {
    original_categories: string[] | null;
    corrected_categories: string[] | null;
    original_tags: string[] | null;
    corrected_tags: string[] | null;
    keyword_context: string | null;
  }) => {
    const parts: string[] = [];
    if (p.original_categories && p.corrected_categories) {
      parts.push(`"${p.keyword_context?.slice(0, 50) || '...'}" → 카테고리: ${p.original_categories.join(',')} → ${p.corrected_categories.join(',')}`);
    }
    if (p.original_tags && p.corrected_tags) {
      parts.push(`태그: [${p.original_tags.join(',')}] → [${p.corrected_tags.join(',')}]`);
    }
    return parts.join('; ');
  }).filter(Boolean).join('\n') : undefined;

  // Fetch user's custom rules
  const userRules = await fetchUserRules(supabase, user.id);

  try {
    const result = await classifyEntryCore(entry, userPatterns, userRules);

    if (!result) {
      const hasImage = entry.image_url && (entry.input_type === 'image' || entry.input_type === 'mixed');
      return NextResponse.json(
        { error: hasImage ? '이미지를 가져올 수 없고, 분류할 텍스트도 없습니다.' : '분류할 내용이 없습니다.' },
        { status: 400 }
      );
    }

    const updateData = buildUpdateData(result, entry.input_type || 'text');

    const { error: updateError } = await supabase
      .from('entries')
      .update(updateData)
      .eq('id', entry_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Classification update error:', updateError);
      return NextResponse.json({ error: '분류 결과 저장에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Classification error:', err);
    return NextResponse.json(
      { categories: ['inbox'], tags: [], error: 'Classification failed' },
      { status: 500 }
    );
  }
}
