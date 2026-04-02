import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function DELETE() {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  // Delete all images from storage for trashed entries
  const { data: trashed } = await supabase
    .from('entries')
    .select('image_url')
    .eq('user_id', user.id)
    .not('deleted_at', 'is', null);

  if (trashed) {
    const paths = trashed
      .filter((e) => e.image_url)
      .map((e) => {
        try {
          return new URL(e.image_url!).pathname.split('/entry-images/')[1];
        } catch {
          return null;
        }
      })
      .filter((p): p is string => !!p);

    if (paths.length > 0) {
      await supabase.storage.from('entry-images').remove(paths);
    }
  }

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('user_id', user.id)
    .not('deleted_at', 'is', null);

  if (error) {
    console.error('Purge error:', error);
    return NextResponse.json({ error: '휴지통 비우기에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
