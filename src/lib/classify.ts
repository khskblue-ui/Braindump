import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { ClassifyResult } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function buildCalendarReference(): string {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const lines: string[] = [];

  // Generate 21 days from today
  for (let i = 0; i < 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const label = i === 0 ? ' ← 오늘' : i === 1 ? ' ← 내일' : '';
    lines.push(
      `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})${label}`
    );
  }

  // Find week boundaries for "이번주" / "다음주" / "차주"
  const todayDay = now.getDay(); // 0=일 ~ 6=토
  // Days until next Monday (Korean weeks start Monday)
  const daysUntilNextMon = todayDay === 0 ? 1 : 8 - todayDay;
  const thisWeekEnd = new Date(now);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + daysUntilNextMon - 1);
  const nextWeekStart = new Date(now);
  nextWeekStart.setDate(nextWeekStart.getDate() + daysUntilNextMon);

  return `이번주 남은 기간: ~${thisWeekEnd.getMonth() + 1}/${thisWeekEnd.getDate()} (${days[thisWeekEnd.getDay()]})\n` +
    `다음주/차주 시작: ${nextWeekStart.getMonth() + 1}/${nextWeekStart.getDate()} (${days[nextWeekStart.getDay()]})\n\n` +
    lines.join('\n');
}

function buildSystemPrompt(userPatterns?: string, userRules?: string, existingTopics?: string): string {
  // Use Korean timezone (KST, UTC+9) for correct date/day-of-week
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const todayStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
  const calendar = buildCalendarReference();

  return `오늘은 ${todayStr}입니다. 모든 날짜와 요일은 한국 시간(KST, UTC+9) 기준으로 판단하세요.

## 날짜 참조 캘린더 (반드시 이 표를 참고하여 날짜를 결정하세요)
${calendar}
 사용자가 입력한 텍스트 또는 이미지를 분석하여 JSON으로 분류하세요.
이미지가 포함된 경우 이미지 내용을 읽고 extracted_text에 추출한 텍스트를 포함하세요.

## 분류 판단 기준 (순서대로 적용)

1단계 — 미래 시간 정보가 있는가?
  특정 **미래** 날짜/시간/요일이 포함되면 → schedule
  ⚠️ 과거 시점("어제", "지난주", "했던", "갔다")은 schedule이 아닙니다 → memo 또는 다른 카테고리로 분류

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
  ⚠️ 주의: 질문형("~어떻게?", "~뭐야?", "~알아보기")은 knowledge가 아닙니다.
    - 답을 담고 있으면 → knowledge (예: "미토콘드리아는 세포의 에너지를 생산하는 소기관이다")
    - 질문/궁금증만 있으면 → memo (예: "미토콘드리아 관련 질병이 뭐가 있지?")
    - 알아보겠다는 의도면 → task (예: "미토콘드리아 질병 조사하기")

## 긴 문서/파일 분류 규칙
- PDF, 긴 텍스트(1000자 이상)는 대부분 참고 자료입니다
- 문서 전체의 주제와 목적을 파악하여 분류하세요
- 학습/참고용 문서 → knowledge
- 회의록, 기록물 → memo
- 계약서, 일정표 등 기한 포함 → schedule + knowledge
- 긴 문서를 inbox로 분류하지 마세요. knowledge 또는 memo 중 하나는 반드시 포함하세요

## URL/링크 분류 규칙
- URL만 포함된 입력(예: "https://example.com/article")은 → memo
- URL과 함께 짧은 메모가 있는 경우에도 → memo (참고용 링크 저장)
- URL이 포함되어 있더라도 명확한 행동 지시가 있으면 해당 카테고리 우선 (예: "이 링크 읽고 정리하기" → task)

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

## 날짜 해석 규칙 (반드시 위의 날짜 참조 캘린더를 보고 결정하세요!)
- "다음주", "차주"는 위 캘린더의 "다음주/차주 시작" 날짜부터의 주
- "이번주"는 위 캘린더의 "이번주 남은 기간"
- "내일모레"는 모레와 같은 의미
- "다다음주"는 다음주의 다음 주
- 요일만 언급된 경우: 캘린더에서 해당 요일을 찾아 가장 가까운 미래 날짜 사용
- 특정 월/일만 있고 연도가 없으면 가장 가까운 미래의 해당 날짜
- schedule이 포함된 경우 summary에 날짜와 요일을 포함하세요
- **중요**: 요일은 캘린더에서 직접 확인하세요. 직접 계산하지 마세요.

## summary 작성 규칙
- 문장형이 아닌 명사구/키워드 중심의 간결체로 작성
- 15자 이내 권장. 핵심만.
- 좋은 예: "엔진오일 교체 예약", "Q2 마케팅 전략 구상", "5월 15일 (목) 디자인팀 미팅"
- 나쁜 예: "엔진오일을 교체해야 합니다", "마케팅 전략을 다시 구상해보는 것이 좋겠습니다"

## 태그 생성 규칙
- 2~4개 권장. 최대 5개
- 한국어 명사 형태 (예: "마케팅", "건강", "회의")
- 단어 단위, 띄어쓰기 없이 (예: "프로젝트관리" (O), "프로젝트 관리" (X))
- 영어 고유명사는 영어 유지 (예: "React", "AWS")
- 너무 일반적인 태그 지양 (예: "정보", "기타" → X)

반드시 JSON만 반환하세요. 다른 텍스트 없이:
{
  "categories": ["primary", "secondary"],
  "tags": ["태그1", "태그2"],
  "topic": "주제명 (knowledge 포함 시만, 그 외 null).${existingTopics ? ' 아래 기존 토픽 중 적합한 것이 있으면 반드시 해당 이름을 그대로 사용하세요. 완전히 새로운 주제일 때만 새 토픽명을 생성하세요.' : ''}",
  "extracted_text": "이미지에서 추출한 텍스트 (이미지인 경우만, 그 외 null)",
  "summary": "간결한 명사구 제목",
  "due_date": "ISO8601 날짜 (schedule 포함 시만, 그 외 null). 반드시 한국 시간(KST, +09:00) 기준. 예: 2026-04-10T15:00:00+09:00",
  "context": "personal 또는 work (모든 카테고리에 적용). 업무/회사/직장 관련이면 work, 개인 생활/취미/건강이면 personal. 맥락이 불분명하면 null. 세부 기준: 회사 동료와의 비업무 약속(점심/회식) → personal, 재택근무 중 개인 용무 → personal, 업무에서 쓸 자기개발/공부 → work, 겸용(업무+개인) → null",
  "related_topics": ["관련 주제"]
}${userPatterns ? `\n\n## 사용자 분류 패턴 (이전 수정 이력 기반)\n${userPatterns}\n이 패턴을 참고하여 분류하되, 맥락에 맞게 판단하세요.\n` : ''}${userRules ? `\n\n## 사용자 정의 규칙 (반드시 우선 적용)\n아래 키워드가 입력에 포함되면 해당 카테고리를 반드시 포함하고, context가 지정된 경우 반드시 해당 값으로 설정하세요. 사용자 정의 규칙은 다른 판단보다 우선합니다.\n${userRules}\n` : ''}${existingTopics ? `\n\n## 기존 토픽 목록 (knowledge 분류 시 기존 토픽명을 우선 재사용하세요)\n${existingTopics}\n` : ''}`;
}

const classifySchema = z.object({
  categories: z.array(z.enum(['task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox'])).min(1).max(3),
  tags: z.array(z.string()).default([]),
  topic: z.string().nullable().optional(),
  extracted_text: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  context: z.enum(['personal', 'work']).nullable().optional(),
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
  context: z.enum(['personal', 'work']).nullable().optional(),
  related_topics: z.array(z.string()).optional(),
});

/** Smart-sample long text: take beginning + ending for better context */
export function smartTruncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const headLen = Math.floor(maxLen * 0.7);
  const tailLen = maxLen - headLen - 20; // 20 for separator
  return text.slice(0, headLen) + '\n\n[...중략...]\n\n' + text.slice(-tailLen);
}

export async function classifyText(
  text: string,
  options?: { maxTokens?: number; userPatterns?: string; userRules?: string; existingTopics?: string; inputType?: string; textLength?: number }
): Promise<ClassifyResult> {
  const meta = options?.inputType
    ? `[입력 유형: ${options.inputType}${options.textLength ? `, 원본 ${options.textLength.toLocaleString()}자` : ''}]\n\n`
    : '';
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: options?.maxTokens ?? 800,
    system: buildSystemPrompt(options?.userPatterns, options?.userRules, options?.existingTopics),
    messages: [{ role: 'user', content: meta + text }],
  });

  return parseResponse(response);
}

export async function classifyImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  text?: string,
  options?: { userPatterns?: string; userRules?: string; existingTopics?: string }
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
    system: buildSystemPrompt(options?.userPatterns, options?.userRules, options?.existingTopics),
    messages: [{ role: 'user', content }],
  });

  return parseResponse(response);
}

/**
 * Fix summary date to match due_date.
 * AI often puts a different date in summary vs due_date.
 * If due_date exists, replace any "M월 D일 (요)" pattern in summary with the correct one from due_date.
 * If no due_date, fix day-of-week from actual calendar.
 */
function fixSummaryDate(summary: string, dueDate?: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const datePattern = /\d{1,2}월\s*\d{1,2}일\s*\([일월화수목금토]\)/g;

  if (dueDate) {
    // Parse due_date in KST
    const d = new Date(dueDate);
    if (!isNaN(d.getTime())) {
      // Convert to KST
      const kst = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
      const correctStr = `${kst.getMonth() + 1}월 ${kst.getDate()}일 (${days[kst.getDay()]})`;

      // If summary has a date pattern, replace the LAST occurrence (usually the target date)
      const matches = [...summary.matchAll(datePattern)];
      if (matches.length > 0) {
        // Replace last date occurrence with correct one from due_date
        const lastMatch = matches[matches.length - 1];
        return (
          summary.slice(0, lastMatch.index!) +
          correctStr +
          summary.slice(lastMatch.index! + lastMatch[0].length)
        );
      }
    }
  }

  // Fallback: fix day-of-week based on actual calendar
  return summary.replace(datePattern, (match) => {
    const m = match.match(/(\d{1,2})월\s*(\d{1,2})일\s*\(([일월화수목금토])\)/);
    if (!m) return match;
    const month = parseInt(m[1], 10);
    const day = parseInt(m[2], 10);
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const testDate = new Date(now.getFullYear(), month - 1, day);
    if (testDate.getMonth() !== month - 1) return match;
    return `${month}월 ${day}일 (${days[testDate.getDay()]})`;
  });
}

function parseResponse(response: Anthropic.Messages.Message): ClassifyResult {
  const text = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn('[classify] JSON 파싱 실패 — inbox fallback. 원본:', text.slice(0, 200));
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
        summary: v.summary ? fixSummaryDate(v.summary, v.due_date ?? undefined) : undefined,
        due_date: v.due_date ?? undefined,
        context: v.context ?? undefined,
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
        summary: v.summary ? fixSummaryDate(v.summary, v.due_date ?? undefined) : undefined,
        due_date: v.due_date ?? undefined,
        context: v.context ?? undefined,
        related_topics: v.related_topics,
      };
    }

    console.warn('[classify] Zod 검증 실패 — inbox fallback. 파싱 결과:', JSON.stringify(parsed).slice(0, 300));
    return { categories: ['inbox'], tags: [] };
  } catch (err) {
    console.warn('[classify] JSON.parse 실패 — inbox fallback:', err);
    return { categories: ['inbox'], tags: [] };
  }
}
