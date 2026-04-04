import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  const { data: entries } = await supabase
    .from('entries')
    .select('topic, created_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .contains('categories', ['knowledge'])
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
