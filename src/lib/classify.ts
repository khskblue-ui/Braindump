import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { ClassifyResult } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function buildSystemPrompt(): string {
  const now = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const todayStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;

  return `오늘은 ${todayStr}입니다. 사용자가 입력한 텍스트 또는 이미지를 분석하여 JSON으로 분류하세요.
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

## 복합 입력 분할 규칙

사용자 입력에 서로 독립적인 항목이 여러 개 포함된 경우, 분할하여 분류하세요.

분할 기준:
- 한 항목을 삭제해도 나머지 항목의 의미가 보존되는 경우에만 분할
- 최대 3개까지만 분할
- 하나의 문맥으로 연결된 내용은 분할하지 않음

분할 안 하는 예:
- "내일 미팅 자료 준비해야 함" → 1개 (미팅과 자료 준비는 하나의 문맥)
- "블로그 글 주제 정해서 초안 쓰기" → 1개 (연쇄 행동)

분할하는 예:
- "내일 3시 미팅, 프레젠테이션 준비, 다크모드 아이디어" → 3개
- "우유 사기, 주말에 부산 여행 알아보기" → 2개

분할이 필요하면 additional_entries 배열에 추가 항목을 넣으세요.
분할이 불필요하면 additional_entries를 생략하세요.

## 날짜 해석 규칙
- "다음주", "차주"는 오늘 기준 다음 월요일이 시작하는 주를 의미
- "이번주"는 오늘이 속한 주 (월~일)
- "내일모레"는 모레와 같은 의미
- "다다음주"는 다음주의 다음 주
- 요일만 언급된 경우 오늘 포함 가장 가까운 미래의 해당 요일
- 특정 월/일만 있고 연도가 없으면 가장 가까운 미래의 해당 날짜
- schedule인 경우 summary에 반드시 요일 포함. 예: "5월 15일 (목) 디자인팀 미팅"

## summary 작성 규칙
- 문장형이 아닌 명사구/키워드 중심의 간결체로 작성
- 15자 이내 권장. 핵심만.
- 좋은 예: "엔진오일 교체 예약", "Q2 마케팅 전략 구상", "5월 15일 (목) 디자인팀 미팅"
- 나쁜 예: "엔진오일을 교체해야 합니다", "마케팅 전략을 다시 구상해보는 것이 좋겠습니다"

반드시 JSON만 반환하세요. 다른 텍스트 없이:
{
  "category": "task" | "idea" | "memo" | "knowledge" | "schedule" | "inbox",
  "tags": ["태그1", "태그2"],
  "topic": "주제명 (knowledge인 경우만, 그 외 null)",
  "extracted_text": "이미지에서 추출한 텍스트 (이미지인 경우만, 그 외 null)",
  "summary": "간결한 명사구 제목",
  "due_date": "ISO8601 날짜 (schedule인 경우만, 그 외 null)",
  "priority": "high" | "medium" | "low" | null,
  "related_topics": ["관련 주제"],
  "additional_entries": [동일 구조 객체] (분할 시에만, 생략 가능)
}`;
}

const classifyItemSchema = z.object({
  category: z.enum(['task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox']),
  tags: z.array(z.string()).default([]),
  topic: z.string().nullable().optional(),
  extracted_text: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).nullable().optional(),
  related_topics: z.array(z.string()).optional(),
});

const classifySchema = classifyItemSchema.extend({
  additional_entries: z.array(classifyItemSchema).max(3).optional(),
});

function toResultItem(validated: z.infer<typeof classifyItemSchema>) {
  return {
    category: validated.category,
    tags: validated.tags,
    topic: validated.topic ?? undefined,
    extracted_text: validated.extracted_text ?? undefined,
    summary: validated.summary ?? undefined,
    due_date: validated.due_date ?? undefined,
    priority: validated.priority ?? undefined,
    related_topics: validated.related_topics,
  };
}

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

function parseResponse(response: Anthropic.Messages.Message): ClassifyResult {
  const text = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { category: 'inbox', tags: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const validated = classifySchema.parse(parsed);
    const result: ClassifyResult = toResultItem(validated);

    if (validated.additional_entries && validated.additional_entries.length > 0) {
      result.additional_entries = validated.additional_entries.map(toResultItem);
    }

    return result;
  } catch {
    return { category: 'inbox', tags: [] };
  }
}
