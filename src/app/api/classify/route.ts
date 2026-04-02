import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { isAllowedImageUrl } from '@/lib/url-validation';
import { classifyText, classifyImage } from '@/lib/classify';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const MAX_BATCH = 50;
const MAX_TEXT_LENGTH = 10000;
const CONCURRENCY = 4; // Parallel AI calls

// PATCH: 미분류(inbox) 항목 일괄 재분류 — 병렬 처리 (동시성 제한)
export async function PATCH() {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { data: inboxEntries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', 'inbox')
    .order('created_at', { ascending: false });

  if (error || !inboxEntries?.length) {
    return NextResponse.json({ reclassified: 0, total: 0 });
  }

  const limited = inboxEntries.slice(0, MAX_BATCH);

  // Process in parallel with concurrency limit
  const results: Array<{ id: string; category: string; error?: string }> = [];
  let reclassified = 0;

  // Chunk into groups of CONCURRENCY
  for (let i = 0; i < limited.length; i += CONCURRENCY) {
    const chunk = limited.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.allSettled(
      chunk.map((entry) => classifySingleEntry(entry, supabase, user))
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

// Helper: classify + update a single entry, returns category on success
async function classifySingleEntry(
  entry: Record<string, unknown>,
  supabase: SupabaseClient,
  user: User
): Promise<string | null> {
  const rawText = (entry.raw_text as string) || '';
  const imageUrl = entry.image_url as string | null;
  const inputType = entry.input_type as string;

  let result;

  if (imageUrl && (inputType === 'image' || inputType === 'mixed')) {
    if (!isAllowedImageUrl(imageUrl)) return null;
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return null;
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    if (rawText.length > MAX_TEXT_LENGTH) return null;
    result = await classifyImage(
      base64,
      contentType as 'image/jpeg' | 'image/png' | 'image/webp',
      rawText || undefined
    );
  } else if (rawText) {
    if (rawText.length > MAX_TEXT_LENGTH) return null;
    result = await classifyText(rawText);
  } else {
    return null;
  }

  const topic =
    result.category === 'knowledge' && result.topic
      ? result.topic.trim().toLowerCase()
      : null;

  const updateData: Record<string, unknown> = {
    category: result.category,
    tags: result.tags,
    summary: result.summary || null,
    priority: result.priority || null,
    ai_metadata: result,
  };
  if (result.extracted_text) updateData.extracted_text = result.extracted_text;
  if (topic) updateData.topic = topic;
  if (result.due_date) updateData.due_date = result.due_date;

  await supabase
    .from('entries')
    .update(updateData)
    .eq('id', entry.id as string)
    .eq('user_id', user.id);

  return result.category;
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

  try {
    let result;

    if (entry.image_url && (entry.input_type === 'image' || entry.input_type === 'mixed')) {
      if (!isAllowedImageUrl(entry.image_url)) {
        return NextResponse.json({ error: '허용되지 않은 이미지 URL입니다.' }, { status: 400 });
      }

      const imageResponse = await fetch(entry.image_url);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const mediaType = contentType as 'image/jpeg' | 'image/png' | 'image/webp';
      const rawText = entry.raw_text || '';
      if (rawText.length > MAX_TEXT_LENGTH) {
        return NextResponse.json({ error: '텍스트가 너무 깁니다.' }, { status: 400 });
      }
      result = await classifyImage(base64, mediaType, rawText || undefined);
    } else if (entry.raw_text) {
      if (entry.raw_text.length > MAX_TEXT_LENGTH) {
        return NextResponse.json({ error: '텍스트가 너무 깁니다.' }, { status: 400 });
      }
      result = await classifyText(entry.raw_text);
    } else {
      return NextResponse.json({ error: '분류할 내용이 없습니다.' }, { status: 400 });
    }

    const topic =
      result.category === 'knowledge' && result.topic
        ? result.topic.trim().toLowerCase()
        : null;

    const updateData: Record<string, unknown> = {
      category: result.category,
      tags: result.tags,
      summary: result.summary || null,
      priority: result.priority || null,
      ai_metadata: result,
    };
    if (result.extracted_text) updateData.extracted_text = result.extracted_text;
    if (topic) updateData.topic = topic;
    if (result.due_date) updateData.due_date = result.due_date;

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
      { category: 'inbox', tags: [], error: 'Classification failed' },
      { status: 200 }
    );
  }
}
