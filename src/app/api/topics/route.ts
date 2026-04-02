import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const { data: entries } = await supabase
    .from('entries')
    .select('topic, created_at')
    .eq('user_id', user.id)
    .eq('category', 'knowledge')
    .not('topic', 'is', null)
    .order('created_at', { ascending: false });

  const topicMap = new Map<string, { count: number; latest: string }>();
  for (const entry of entries || []) {
    if (!entry.topic) continue;
    const existing = topicMap.get(entry.topic);
    if (existing) {
      existing.count += 1;
    } else {
      topicMap.set(entry.topic, { count: 1, latest: entry.created_at });
    }
  }

  const topics = Array.from(topicMap.entries())
    .map(([name, { count, latest }]) => ({ name, count, latest }))
    .sort((a, b) => new Date(b.latest).getTime() - new Date(a.latest).getTime());

  return NextResponse.json({ topics });
}
