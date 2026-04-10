import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { attachSignedUrls } from '@/lib/signed-url';
import type { SupabaseClient } from '@supabase/supabase-js';

async function recordClassifyPattern(
  supabase: SupabaseClient,
  userId: string,
  entryId: string,
  original: { categories?: string[]; tags?: string[] },
  updated: { categories?: string[]; tags?: string[] },
  rawText?: string
) {
  const categoriesChanged = JSON.stringify(original.categories) !== JSON.stringify(updated.categories);
  const tagsChanged = JSON.stringify(original.tags?.sort()) !== JSON.stringify(updated.tags?.sort());

  if (!categoriesChanged && !tagsChanged) return;

  await supabase.from('user_classify_patterns').insert({
    user_id: userId,
    entry_id: entryId,
    original_categories: categoriesChanged ? original.categories : null,
    corrected_categories: categoriesChanged ? updated.categories : null,
    original_tags: tagsChanged ? original.tags : null,
    corrected_tags: tagsChanged ? updated.tags : null,
    keyword_context: rawText?.slice(0, 200) || null,
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { id } = await params;

  const { data: entry, error } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !entry) {
    return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
  }

  const [entryWithSignedUrls] = await attachSignedUrls(supabase, [entry]);

  return NextResponse.json({ entry: entryWithSignedUrls });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { id } = await params;
  const body = await request.json();

  // Allowlist only updatable fields
  const allowed: Record<string, unknown> = {};
  const fields = ['raw_text', 'categories', 'tags', 'topic', 'summary', 'due_date', 'priority', 'is_completed', 'is_pinned', 'deleted_at', 'reminders', 'context'] as const;
  for (const key of fields) {
    if (key in body) allowed[key] = body[key];
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: '수정할 필드가 없습니다.' }, { status: 400 });
  }

  // Fetch original entry to detect AI classification corrections
  const { data: originalEntry } = await supabase
    .from('entries')
    .select('categories, tags, priority, raw_text')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  const { data: entry, error } = await supabase
    .from('entries')
    .update(allowed)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Entry update error:', error);
    return NextResponse.json({ error: '항목 수정에 실패했습니다.' }, { status: 500 });
  }
  if (!entry) return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });

  // Record pattern if AI-classified fields were corrected
  if (originalEntry && (allowed.categories !== undefined || allowed.tags !== undefined)) {
    await recordClassifyPattern(
      supabase,
      user.id,
      id,
      {
        categories: originalEntry.categories,
        tags: originalEntry.tags,
      },
      {
        categories: allowed.categories as string[] | undefined,
        tags: allowed.tags as string[] | undefined,
      },
      originalEntry.raw_text
    ).catch((err) => console.error('Pattern recording error:', err));
  }

  return NextResponse.json({ entry });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { id } = await params;

  // Get entry to check for image
  const { data: entry } = await supabase
    .from('entries')
    .select('image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  // Delete image from storage if exists (wrapped in try/catch so DB delete always proceeds)
  if (entry?.image_url) {
    try {
      const path = new URL(entry.image_url).pathname.split('/entry-images/')[1];
      if (path) {
        await supabase.storage.from('entry-images').remove([path]);
      }
    } catch (err) {
      console.error('Storage cleanup error:', err);
    }
  }

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Entry delete error:', error);
    return NextResponse.json({ error: '항목 삭제에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
