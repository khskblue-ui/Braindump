import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { id } = await params;

  // Restore entry from trash
  const { data: entry, error } = await supabase
    .from('entries')
    .update({ deleted_at: null })
    .eq('id', id)
    .eq('user_id', user.id)
    .not('deleted_at', 'is', null)
    .select()
    .single();

  if (error || !entry) {
    return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
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
    .not('deleted_at', 'is', null)
    .single();

  // Delete image from storage if exists
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
    console.error('Permanent delete error:', error);
    return NextResponse.json({ error: '항목 삭제에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
