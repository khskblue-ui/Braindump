import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { classifyText, classifyImage } from '@/lib/classify';

// PATCH: 미분류(inbox) 항목 일괄 재분류
export async function PATCH() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { data: inboxEntries, error } = await supabase
    .from('entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('category', 'inbox')
    .order('created_at', { ascending: false });

  if (error || !inboxEntries?.length) {
    return NextResponse.json({ reclassified: 0, total: 0 });
  }

  let reclassified = 0;
  const results: Array<{ id: string; category: string; error?: string }> = [];

  for (const entry of inboxEntries) {
    try {
      const { data: fullEntry } = await supabase
        .from('entries')
        .select('*')
        .eq('id', entry.id)
        .eq('user_id', user.id)
        .single();

      if (!fullEntry) continue;

      let result;
      if (fullEntry.image_url && (fullEntry.input_type === 'image' || fullEntry.input_type === 'mixed')) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl && !fullEntry.image_url.startsWith(supabaseUrl)) continue;

        const imageResponse = await fetch(fullEntry.image_url);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        result = await classifyImage(base64, contentType as 'image/jpeg' | 'image/png' | 'image/webp', fullEntry.raw_text || undefined);
      } else if (fullEntry.raw_text) {
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

      await supabase.from('entries').update(updateData).eq('id', entry.id).eq('user_id', user.id);
      reclassified++;
      results.push({ id: entry.id, category: result.category });
    } catch (err) {
      results.push({ id: entry.id, category: 'inbox', error: err instanceof Error ? err.message : 'unknown' });
    }
  }

  return NextResponse.json({ reclassified, total: inboxEntries.length, results });
}

// POST: 단건 분류
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

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
      // Validate image URL origin (prevent SSRF)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !entry.image_url.startsWith(supabaseUrl)) {
        return NextResponse.json({ error: '허용되지 않은 이미지 URL입니다.' }, { status: 400 });
      }

      // Fetch image and convert to base64
      const imageResponse = await fetch(entry.image_url);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');

      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const mediaType = contentType as 'image/jpeg' | 'image/png' | 'image/webp';

      result = await classifyImage(base64, mediaType, entry.raw_text || undefined);
    } else if (entry.raw_text) {
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
      return NextResponse.json({ error: updateError.message }, { status: 500 });
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
