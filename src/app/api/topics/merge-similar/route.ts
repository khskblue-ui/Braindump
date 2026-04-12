import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// POST: Detect similar topics and auto-merge them
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  // 1. Fetch all knowledge topics with counts
  const { data: entries } = await supabase
    .from('entries')
    .select('id, topic, summary, raw_text')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .contains('categories', ['knowledge'])
    .not('topic', 'is', null);

  if (!entries?.length) {
    return NextResponse.json({ merged: [], message: '토픽이 없습니다.' });
  }

  // Build topic map with sample entries
  const topicMap = new Map<string, { count: number; entries: { id: string; summary: string | null }[] }>();
  for (const e of entries) {
    if (!e.topic) continue;
    const existing = topicMap.get(e.topic);
    if (existing) {
      existing.count++;
      if (existing.entries.length < 2) {
        existing.entries.push({ id: e.id, summary: e.summary || e.raw_text?.slice(0, 100) || null });
      }
    } else {
      topicMap.set(e.topic, {
        count: 1,
        entries: [{ id: e.id, summary: e.summary || e.raw_text?.slice(0, 100) || null }],
      });
    }
  }

  const topicNames = Array.from(topicMap.keys());

  // Need at least 2 topics to find similarities
  if (topicNames.length < 2) {
    return NextResponse.json({ merged: [], message: '토픽이 2개 미만이어서 비교할 수 없습니다.' });
  }

  // 2. Ask AI to find similar topic groups
  const topicListWithSamples = topicNames.map((name) => {
    const info = topicMap.get(name)!;
    const samples = info.entries.map((e) => e.summary || '(내용 없음)').join(', ');
    return `- "${name}" (${info.count}개) — 예: ${samples}`;
  }).join('\n');

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `당신은 토픽 유사성 분석가입니다. 주어진 토픽 목록에서 의미적으로 같은 주제를 다루는 토픽 그룹을 찾으세요.
반드시 JSON 배열만 반환하세요. 다른 텍스트 없이.
유사한 그룹이 없으면 빈 배열 [] 반환.

각 그룹:
{
  "sources": ["토픽A", "토픽B"],
  "merged_name": "통합 토픽명 (간결한 한국어 명사구, 2-5단어. 기존 토픽명 중 적절한 것이 있으면 그대로 사용 가능)",
  "reason": "병합 이유 (10자 이내)"
}

주의:
- 정말 같은 주제를 다루는 것만 병합. 단순히 "개발"이라는 공통점만으로 묶지 마세요.
- 예: "React 훅 사용법"과 "React 상태 관리" → "React" (O)
- 예: "React 훅"과 "요리 레시피" → 병합 안 함 (X)
- 예: "python 기초"와 "python 데이터 분석" → "Python" (O)`,
      messages: [{
        role: 'user',
        content: `토픽 목록:\n${topicListWithSamples}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ merged: [], message: '유사한 토픽이 없습니다.' });
    }

    const groups = JSON.parse(jsonMatch[0]) as Array<{
      sources: string[];
      merged_name: string;
      reason: string;
    }>;

    if (!groups.length) {
      return NextResponse.json({ merged: [], message: '유사한 토픽이 없습니다.' });
    }

    // 3. Execute merges
    const mergeResults: Array<{ sources: string[]; target: string; updated: number; reason: string }> = [];

    for (const group of groups) {
      const targetName = group.merged_name.trim().toLowerCase();
      if (!targetName || group.sources.length < 2) continue;

      // Validate all source topics exist
      const validSources = group.sources.filter((s) => topicMap.has(s));
      if (validSources.length < 2) continue;

      // Skip if all sources are already the target name
      const sourcesToUpdate = validSources.filter((s) => s !== targetName);
      if (sourcesToUpdate.length === 0) continue;

      let totalUpdated = 0;
      for (const sourceTopic of sourcesToUpdate) {
        const { data } = await supabase
          .from('entries')
          .update({ topic: targetName })
          .eq('user_id', user.id)
          .eq('topic', sourceTopic)
          .is('deleted_at', null)
          .select('id');

        totalUpdated += data?.length || 0;
      }

      if (totalUpdated > 0) {
        mergeResults.push({
          sources: validSources,
          target: targetName,
          updated: totalUpdated,
          reason: group.reason,
        });
      }
    }

    return NextResponse.json({
      merged: mergeResults,
      message: mergeResults.length > 0
        ? `${mergeResults.length}개 토픽 그룹이 병합되었습니다.`
        : '유사한 토픽이 없습니다.',
    });
  } catch (error) {
    console.error('Topic merge-similar error:', error);
    return NextResponse.json(
      { error: '유사 토픽 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
