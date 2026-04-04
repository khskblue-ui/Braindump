import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { ClassifyResult } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function buildSystemPrompt(): string {
  // Use Korean timezone (KST, UTC+9) for correct date/day-of-week
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const todayStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;

  return `오늘은 ${todayStr}입니다. 모든 날짜와 요일은 한국 시간(KST, UTC+9) 기준으로 판단하세요. 사용자가 입력한 텍스트 또는 이미지를 분석하여 JSON으로 분류하세요.
이미지가 포함된 경우 이미지 내용을 읽고 extracted_text에 추출한 텍스트를 포함하세요.

## 분류 판단 기준 (순서대로 적용)

1단계 — 시간 정보가 있는가?
  특정 날짜/시간/요일이 포함되면 → schedule

2단계 — "했다/안했다"로 완결할 수 있는가?
  구체적 행동이고, 완료 시 체크할 수 있으면 → task
  예: "보고서 제출", "우유 사기", "엄마한테 전화"
  한국어 신호: ~해야 함, ~하기, ~할 것, ~해야지, ~마감, ~까지, ~제출

3단계 — 아직 열려있는 생각인가?
  실행 여부가 미정이거나, 더 발전시킬 여지가 있으면 → idea
  예: "앱에 다크모드 넣으면 좋겠다", "부업 알아보기"
  한국어 신호: ~하면 좋겠다, ~해볼까, ~어떨까, ~싶다, ~고민

4단계 — 참고용 기록인가?
  사실/결과/상황 기록이면 → memo
  학습한 정보/개념 정리이면 → knowledge

5단계 — 위 어디에도 해당하지 않으면 → inbox

## 카테고리 정의
- task: 완료 시점이 있고, 끝나면 체크할 수 있는 행동 (소멸형)
- idea: 실행 여부 미정, 발전시킬 여지가 있는 생각 (성장형)
- memo: 참고용 정보, 사실 기록, 노트 (보존형)
- knowledge: 학습한 정보, 지식 스니펫 (축적형)
- schedule: 특정 날짜/시간이 있는 항목 (시한형)
- inbox: 판단 불가 (미분류)

## 복수 카테고리 규칙

하나의 입력이 여러 성격을 가질 수 있습니다. 해당하는 카테고리를 모두 포함하세요.
- 첫 번째 값이 가장 지배적인 카테고리 (primary)
- 최대 3개까지
- 단일 성격이면 1개만

예:
- "내일 3시 미팅 자료 준비" → ["schedule", "task"] (일정이면서 할 일)
- "블로그 글 써야겠다" → ["idea"] (아직 열린 생각)
- "보고서 제출하기" → ["task"] (단일 할 일)
- "회의에서 예산 500만원 확정, 다음주 수요일까지 보고서 제출" → ["schedule", "task", "memo"]

## 날짜 해석 규칙
- "다음주", "차주"는 오늘 기준 다음 월요일이 시작하는 주를 의미
- "이번주"는 오늘이 속한 주 (월~일)
- "내일모레"는 모레와 같은 의미
- "다다음주"는 다음주의 다음 주
- 요일만 언급된 경우 오늘 포함 가장 가까운 미래의 해당 요일
- 특정 월/일만 있고 연도가 없으면 가장 가까운 미래의 해당 날짜
- schedule이 포함된 경우 summary에 날짜와 요일을 포함하세요. 예: "5월 15일 (목) 디자인팀 미팅"
- 요일은 반드시 정확하게 계산하세요. 틀리면 안 됩니다.

## summary 작성 규칙
- 문장형이 아닌 명사구/키워드 중심의 간결체로 작성
- 15자 이내 권장. 핵심만.
- 좋은 예: "엔진오일 교체 예약", "Q2 마케팅 전략 구상", "5월 15일 (목) 디자인팀 미팅"
- 나쁜 예: "엔진오일을 교체해야 합니다", "마케팅 전략을 다시 구상해보는 것이 좋겠습니다"

반드시 JSON만 반환하세요. 다른 텍스트 없이:
{
  "categories": ["primary", "secondary"],
  "tags": ["태그1", "태그2"],
  "topic": "주제명 (knowledge 포함 시만, 그 외 null)",
  "extracted_text": "이미지에서 추출한 텍스트 (이미지인 경우만, 그 외 null)",
  "summary": "간결한 명사구 제목",
  "due_date": "ISO8601 날짜 (schedule 포함 시만, 그 외 null). 반드시 한국 시간(KST, +09:00) 기준. 예: 2026-04-10T15:00:00+09:00",
  "priority": "high" | "medium" | "low" | null,
  "related_topics": ["관련 주제"]
}`;
}

const classifySchema = z.object({
  categories: z.array(z.enum(['task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox'])).min(1).max(3),
  tags: z.array(z.string()).default([]),
  topic: z.string().nullable().optional(),
  extracted_text: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).nullable().optional(),
  related_topics: z.array(z.string()).optional(),
});

// Legacy schema: accept old single-category format and convert
const legacyCategorySchema = z.object({
  category: z.enum(['task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox']),
  tags: z.array(z.string()).default([]),
  topic: z.string().nullable().optional(),
  extracted_text: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).nullable().optional(),
  related_topics: z.array(z.string()).optional(),
});

export async function classifyText(text: string, options?: { maxTokens?: number }): Promise<ClassifyResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: options?.maxTokens ?? 800,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: text }],
  });

  return parseResponse(response);
}

export async function classifyImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  text?: string
): Promise<ClassifyResult> {
  const content: Anthropic.Messages.ContentBlockParam[] = [
    {
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: imageBase64 },
    },
  ];

  if (text) {
    content.push({ type: 'text', text: `첨부 텍스트: ${text}` });
  } else {
    content.push({ type: 'text', text: '이 이미지를 분석하고 분류해주세요.' });
  }

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content }],
  });

  return parseResponse(response);
}

/**
 * Fix incorrect day-of-week in summary text by computing from actual dates.
 * AI often miscalculates day-of-week, so we correct patterns like "4월 17일 (목)" → "4월 17일 (금)"
 */
function fixDayOfWeek(summary: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  // Match patterns: "M월 D일 (요)" or "M월 D일(요)"
  return summary.replace(
    /(\d{1,2})월\s*(\d{1,2})일\s*\(([일월화수목금토])\)/g,
    (match, monthStr, dayStr, dayChar) => {
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      // Use current year in KST
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
      let year = now.getFullYear();
      // If the date is in the past, it might be next year
      const testDate = new Date(year, month - 1, day);
      if (testDate.getMonth() !== month - 1) return match; // invalid date
      const correctDay = days[testDate.getDay()];
      if (correctDay === dayChar) return match; // already correct
      return `${month}월 ${day}일 (${correctDay})`;
    }
  );
}

function parseResponse(response: Anthropic.Messages.Message): ClassifyResult {
  const text = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { categories: ['inbox'], tags: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Try new format first (categories array)
    const newResult = classifySchema.safeParse(parsed);
    if (newResult.success) {
      const v = newResult.data;
      return {
        categories: v.categories,
        tags: v.tags,
        topic: v.topic ?? undefined,
        extracted_text: v.extracted_text ?? undefined,
        summary: v.summary ? fixDayOfWeek(v.summary) : undefined,
        due_date: v.due_date ?? undefined,
        priority: v.priority ?? undefined,
        related_topics: v.related_topics,
      };
    }

    // Fallback: old single-category format
    const legacyResult = legacyCategorySchema.safeParse(parsed);
    if (legacyResult.success) {
      const v = legacyResult.data;
      return {
        categories: [v.category],
        tags: v.tags,
        topic: v.topic ?? undefined,
        extracted_text: v.extracted_text ?? undefined,
        summary: v.summary ? fixDayOfWeek(v.summary) : undefined,
        due_date: v.due_date ?? undefined,
        priority: v.priority ?? undefined,
        related_topics: v.related_topics,
      };
    }

    return { categories: ['inbox'], tags: [] };
  } catch {
    return { categories: ['inbox'], tags: [] };
  }
}
