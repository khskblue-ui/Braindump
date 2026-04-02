import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { attachSignedUrls } from '@/lib/signed-url';

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
  const fields = ['raw_text', 'category', 'tags', 'topic', 'summary', 'due_date', 'priority', 'is_completed'] as const;
  for (const key of fields) {
    if (key in body) allowed[key] = body[key];
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: '수정할 필드가 없습니다.' }, { status: 400 });
  }

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
