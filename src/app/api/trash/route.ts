import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  // Auto-purge: check user settings and delete expired trash
  const { data: settings } = await supabase
    .from('user_settings')
    .select('auto_purge_days')
    .eq('user_id', user.id)
    .single();

  const purgeDays = settings?.auto_purge_days ?? 30;
  if (purgeDays > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - purgeDays);
    await supabase
      .from('entries')
      .delete()
      .eq('user_id', user.id)
      .not('deleted_at', 'is', null)
      .lt('deleted_at', cutoff.toISOString());
  }

  // Fetch remaining trash entries
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  if (error) {
    console.error('Trash fetch error:', error);
    return NextResponse.json({ error: '휴지통 조회에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ entries: entries || [] });
}
