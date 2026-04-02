import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topic: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { topic } = await params;
  const decodedTopic = decodeURIComponent(topic);

  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic', decodedTopic)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ entries: entries || [] });
}
