import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { isAllowedImageUrl } from '@/lib/url-validation';
import { classifyText, classifyImage } from '@/lib/classify';

const MAX_BATCH = 50;
const MAX_TEXT_LENGTH = 10000;

// PATCH: 미분류(inbox) 항목 일괄 재분류
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

  let reclassified = 0;
  const results: Array<{ id: string; category: string; error?: string }> = [];

  for (const fullEntry of limited) {
    try {
      let result;
      if (fullEntry.image_url && (fullEntry.input_type === 'image' || fullEntry.input_type === 'mixed')) {
        if (!isAllowedImageUrl(fullEntry.image_url)) continue;

        const imageResponse = await fetch(fullEntry.image_url);
        if (!imageResponse.ok) continue;
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const rawText = fullEntry.raw_text || '';
        if (rawText.length > MAX_TEXT_LENGTH) continue;
        result = await classifyImage(base64, contentType as 'image/jpeg' | 'image/png' | 'image/webp', rawText || undefined);
      } else if (fullEntry.raw_text) {
        if (fullEntry.raw_text.length > MAX_TEXT_LENGTH) continue;
        result = await classifyText(fullEntry.raw_text);
      } else {
        continue;
      }

      const topic = result.category === 'knowledge' && result.topic
        ? result.topic.trim().toLowerCase() : null;

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

      await supabase.from('entries').update(updateData).eq('id', fullEntry.id).eq('user_id', user.id);
      reclassified++;
      results.push({ id: fullEntry.id, category: result.category });
    } catch (err) {
      console.error('Batch reclassify error for entry', fullEntry.id, err);
      results.push({ id: fullEntry.id, category: 'inbox', error: '분류 처리 중 오류가 발생했습니다.' });
    }
  }

  return NextResponse.json({ reclassified, total: inboxEntries.length, results });
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

  // Fetch the entry
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

      // Fetch image and convert to base64
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

    // Normalize topic for knowledge category
    const topic = result.category === 'knowledge' && result.topic
      ? result.topic.trim().toLowerCase()
      : null;

    // Update entry with classification result
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
    // Non-blocking: keep entry as inbox
    return NextResponse.json(
      { category: 'inbox', tags: [], error: 'Classification failed' },
      { status: 200 }
    );
  }
}
