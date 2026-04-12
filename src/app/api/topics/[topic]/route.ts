import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ topic: string }> }
) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { topic } = await params;
  const decodedTopic = decodeURIComponent(topic);

  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .eq('topic', decodedTopic)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Topic entries fetch error:', error);
    return NextResponse.json({ error: '항목 조회에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ entries: entries || [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ topic: string }> }
) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { topic } = await params;
  const oldTopic = decodeURIComponent(topic);

  const body = await request.json();
  const newName = (body.name || '').trim().toLowerCase();

  if (!newName) {
    return NextResponse.json({ error: '토픽 이름을 입력해주세요.' }, { status: 400 });
  }

  if (newName === oldTopic) {
    return NextResponse.json({ success: true, updated: 0 });
  }

  const { data, error } = await supabase
    .from('entries')
    .update({ topic: newName })
    .eq('user_id', user.id)
    .eq('topic', oldTopic)
    .is('deleted_at', null)
    .select('id');

  if (error) {
    console.error('Topic rename error:', error);
    return NextResponse.json({ error: '토픽 이름 변경에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: data?.length || 0 });
}
