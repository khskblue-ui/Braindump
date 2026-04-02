import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { data: settings, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: '설정 조회에 실패했습니다.' }, { status: 500 });
  }

  // Return defaults if no settings row exists
  return NextResponse.json({
    settings: settings || { auto_purge_days: 30 },
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const body = await request.json();
  const { auto_purge_days } = body;

  if (auto_purge_days !== undefined && auto_purge_days !== null) {
    const days = Number(auto_purge_days);
    if (!Number.isInteger(days) || (days !== 0 && days < 1)) {
      return NextResponse.json({ error: '유효하지 않은 값입니다.' }, { status: 400 });
    }
  }

  // Upsert: insert if not exists, update if exists
  const { data: settings, error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user.id,
        auto_purge_days: auto_purge_days ?? 30,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: '설정 저장에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ settings });
}
