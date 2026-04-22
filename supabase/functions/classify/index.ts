import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CategoryValue = "task" | "idea" | "memo" | "knowledge" | "schedule" | "inbox";
type PriorityValue = "high" | "medium" | "low";

interface ClassifyResult {
  categories: CategoryValue[];
  tags: string[];
  topic?: string;
  extracted_text?: string;
  summary?: string;
  due_date?: string;
  context?: 'personal' | 'work';
  related_topics?: string[];
}

// ---------------------------------------------------------------------------
// Calendar & system-prompt builders (faithfully ported from classify.ts)
// ---------------------------------------------------------------------------

function buildCalendarReference(): string {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  // Find week boundaries (Korean weeks: Mon–Sun)
  const todayDay = now.getDay(); // 0=일 ~ 6=토
  const daysUntilNextMon = todayDay === 0 ? 1 : 8 - todayDay;

  const nextWeekStartDate = new Date(now);
  nextWeekStartDate.setDate(nextWeekStartDate.getDate() + daysUntilNextMon);
  const weekAfterStartDate = new Date(nextWeekStartDate);
  weekAfterStartDate.setDate(weekAfterStartDate.getDate() + 7);

  // Generate 21 days with week labels
  const lines: string[] = [];
  for (let i = 0; i < 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayLabel = i === 0 ? " ← 오늘" : i === 1 ? " ← 내일" : "";

    // Determine week tag
    let weekTag: string;
    if (d < nextWeekStartDate) {
      weekTag = "[이번주]";
    } else if (d < weekAfterStartDate) {
      weekTag = "[다음주]";
    } else {
      weekTag = "[다다음주]";
    }

    lines.push(
      `${weekTag} ${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})${dayLabel}`
    );
  }

  // Build quick-reference for "다음주 X요일" lookups
  const nextWeekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(nextWeekStartDate);
    d.setDate(d.getDate() + i);
    nextWeekDays.push(`${days[d.getDay()]}=${d.getMonth() + 1}/${d.getDate()}`);
  }

  return `## 다음주 요일 빠른 참조\n다음주: ${nextWeekDays.join(", ")}\n\n` +
    lines.join("\n");
}

export function buildSystemPrompt(userPatterns?: string, userRules?: string): string {
  // Use Korean timezone (KST, UTC+9) for correct date/day-of-week
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const todayStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const currentTimeStr = `${hours}:${minutes}`;
  const calendar = buildCalendarReference();

  return `오늘은 ${todayStr}이고, 현재 시각은 ${currentTimeStr} (한국 시간, KST)입니다. 모든 날짜와 요일은 한국 시간(KST, UTC+9) 기준으로 판단하세요.

## 날짜 참조 캘린더 (반드시 이 표를 참고하여 날짜를 결정하세요)
${calendar}

## 분류 원칙 (판단 전 반드시 먼저 적용)

⚠️ 사용자 정의 규칙(user_classify_rules)은 아래 원칙보다 우선합니다. 규칙에 매칭되면 원칙 B/C/D 무시하고 규칙 카테고리를 반드시 포함하세요.

[원칙 A — 한 Entry = 한 primary]
categories 배열의 첫 번째 값은 AI가 가장 확신하는 단일 카테고리 하나입니다. 내용 유사성·부수 명사·"완료 후 가치" 같은 이유로 추가 카테고리를 붙이지 마세요.
- ✅ "A사 견적 팀장님 보고" → ["task"]
- ❌ "보고서 쓰기" → ["task", "memo"]  (보고서라는 명사 때문에 memo 금지)

[원칙 B — secondary는 schedule만]
두 번째 카테고리는 오직 "schedule"만 허용됩니다. 그리고 schedule은 **명시적 날짜/시간이 Action의 속성(=Action의 마감/발생 시점)일 때만** 붙입니다.
- ✅ "내일 3시 팀 미팅 자료 준비" → ["task", "schedule"]  (내일 3시가 준비 Action의 마감)
- ❌ "4/30 출고 일정 사전 공유하기" → ["task"]  (4/30은 "출고 일정"의 속성이지 공유 Action의 속성이 아님. due_date=null)

[원칙 C — 날짜 소유 구분]
문장 내 날짜가 **행위의 대상**(ReferenceTarget)이 가진 속성이면 schedule/due_date에 반영하지 마세요. 날짜가 **행위 자체**의 속성일 때만 반영합니다.
- ✅ "4/30에 보고하기" → ["task", "schedule"], due_date=4/30  (4/30은 보고 Action의 마감)
- ❌ "2/15 면접 일정 공유" → ["task"], due_date=null  (2/15는 면접의 속성, 공유 Action의 속성 아님)

[원칙 D — 완료 후 기록은 별도 Entry]
"회의록 작성하기"는 task입니다. 작성된 회의록 본문은 사용자가 별도 Entry로 저장합니다. 원 Entry에 memo를 덧붙이지 마세요.
- ✅ "회의록 작성하기" → ["task"]
- ❌ "회의록 작성하기" → ["task", "memo"]

⚠️ categories 배열 길이는 최대 2입니다. 3개 이상 반환하면 분류가 거부됩니다.

 사용자가 입력한 텍스트 또는 이미지를 분석하여 JSON으로 분류하세요.
이미지가 포함된 경우 이미지 내용을 읽고 extracted_text에 추출한 텍스트를 포함하세요.

## 분류 판단 기준 (순서대로 적용)

1단계 — Action이 가진 날짜/시간이 있는가?
  문장의 "행위(Action) 자체"가 특정 날짜/시간/요일을 마감·발생 시점으로 가지면 → "schedule" 을 secondary로 추가
  ⚠️ 날짜가 행위의 **대상**(예: "공유할 출고 일정이 4/30")에 속한 속성이면 schedule을 붙이지 않습니다. 원칙 B·C 참조.
  예: "내일 3시 팀 미팅 자료 준비" — 준비 Action의 마감이 내일 3시 → schedule 추가
  예: "4/30 출고 일정 공유" — 4/30은 출고 일정의 속성, 공유 Action의 속성 아님 → schedule 제외

2단계 — "했다/안했다"로 완결할 수 있는가?
  구체적 행동이고, 완료 시 체크할 수 있으면 → task
  예: "A사 견적 팀장님 보고", "B법인 계약서 검토", "C연구소 샘플 발송"
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

하나의 입력이 여러 성격을 가질 수 있습니다. 원칙 A/B를 반드시 먼저 적용하세요.
- 첫 번째 값이 가장 지배적인 카테고리 (primary)
- 최대 2개까지 (두 번째는 오직 "schedule"만 허용 — 원칙 B 참조)
- 단일 성격이면 1개만

예:
- "내일 3시 미팅 자료 준비" → ["task", "schedule"] (준비 Action의 마감이 내일 3시)
- "블로그 글 써야겠다" → ["idea"] (아직 열린 생각)
- "보고서 제출하기" → ["task"] (단일 할 일)

## 날짜 해석 규칙 (반드시 위의 날짜 참조 캘린더를 보고 결정하세요!)
- "다음주", "차주"는 위 캘린더의 "다음주/차주 시작" 날짜부터의 주
- "이번주"는 위 캘린더의 "이번주 남은 기간"
- "내일모레"는 모레와 같은 의미
- "다다음주"는 다음주의 다음 주
- 요일만 언급된 경우: 캘린더에서 해당 요일을 찾아 가장 가까운 미래 날짜 사용
- 특정 월/일만 있고 연도가 없으면 가장 가까운 미래의 해당 날짜
- "N분 뒤/후", "N시간 뒤/후" 등 상대적 시간 표현은 반드시 위의 현재 시각 기준으로 계산하세요
  예: 현재 11:00이고 "30분 뒤" → 11:30, "1시간 후" → 12:00, "2시간 반 뒤" → 13:30
- schedule이 포함된 경우 summary에 날짜와 요일을 포함하세요
- **중요**: 요일은 캘린더에서 직접 확인하세요. 직접 계산하지 마세요.

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
  "context": "personal 또는 work (모든 카테고리에 적용). 업무/회사/직장 관련이면 work, 개인 생활/취미/건강이면 personal. 맥락이 불분명하면 null",
  "related_topics": ["관련 주제"]
}${userPatterns ? `\n\n## 사용자 분류 패턴 (이전 수정 이력 기반)\n${userPatterns}\n이 패턴을 참고하여 분류하되, 맥락에 맞게 판단하세요.\n` : ''}${userRules ? `\n\n## 사용자 정의 규칙 (반드시 우선 적용)\n아래 키워드가 입력에 포함되면 해당 카테고리를 반드시 포함하고, context가 지정된 경우 반드시 해당 값으로 설정하세요. 사용자 정의 규칙은 다른 판단보다 우선합니다.\n${userRules}\n사용자 정의 규칙은 원칙 A/B/C/D보다 우선합니다.\n` : ''}`;
}

// ---------------------------------------------------------------------------
// Post-processing: fixSummaryDate (faithfully ported from classify.ts)
// ---------------------------------------------------------------------------

function fixSummaryDate(summary: string, dueDate?: string): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const datePattern = /\d{1,2}월\s*\d{1,2}일\s*\([일월화수목금토]\)/g;

  if (dueDate) {
    // Parse due_date in KST
    const d = new Date(dueDate);
    if (!isNaN(d.getTime())) {
      // Convert to KST
      const kst = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
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
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const testDate = new Date(now.getFullYear(), month - 1, day);
    if (testDate.getMonth() !== month - 1) return match;
    return `${month}월 ${day}일 (${days[testDate.getDay()]})`;
  });
}

// ---------------------------------------------------------------------------
// Manual validation (replaces Zod since we're in Deno)
// ---------------------------------------------------------------------------

const VALID_CATEGORIES = new Set(["task", "idea", "memo", "knowledge", "schedule", "inbox"]);
const VALID_PRIORITIES = new Set(["high", "medium", "low"]);

function isValidCategory(v: unknown): v is CategoryValue {
  return typeof v === "string" && VALID_CATEGORIES.has(v);
}

function isValidPriority(v: unknown): v is PriorityValue {
  return typeof v === "string" && VALID_PRIORITIES.has(v);
}

function parseNewFormat(parsed: Record<string, unknown>): ClassifyResult | null {
  const { categories, tags, topic, extracted_text, summary, due_date, context, related_topics } =
    parsed;

  // categories: array of 1-2 valid values (원칙 B — secondary는 schedule만)
  if (!Array.isArray(categories) || categories.length === 0 || categories.length > 2) return null;
  if (!categories.every(isValidCategory)) return null;

  // tags: array of strings (default [])
  const safeTags = Array.isArray(tags) ? tags.filter((t) => typeof t === "string") : [];

  return {
    categories: categories as CategoryValue[],
    tags: safeTags,
    topic: typeof topic === "string" ? topic : undefined,
    extracted_text: typeof extracted_text === "string" ? extracted_text : undefined,
    summary:
      typeof summary === "string"
        ? fixSummaryDate(summary, typeof due_date === "string" ? due_date : undefined)
        : undefined,
    due_date: typeof due_date === "string" ? due_date : undefined,
    context: (context === "personal" || context === "work") ? context : undefined,
    related_topics: Array.isArray(related_topics)
      ? related_topics.filter((t) => typeof t === "string")
      : undefined,
  };
}

function parseLegacyFormat(parsed: Record<string, unknown>): ClassifyResult | null {
  const { category, tags, topic, extracted_text, summary, due_date, context, related_topics } =
    parsed;

  if (!isValidCategory(category)) return null;

  const safeTags = Array.isArray(tags) ? tags.filter((t) => typeof t === "string") : [];

  return {
    categories: [category],
    tags: safeTags,
    topic: typeof topic === "string" ? topic : undefined,
    extracted_text: typeof extracted_text === "string" ? extracted_text : undefined,
    summary:
      typeof summary === "string"
        ? fixSummaryDate(summary, typeof due_date === "string" ? due_date : undefined)
        : undefined,
    due_date: typeof due_date === "string" ? due_date : undefined,
    context: (context === "personal" || context === "work") ? context : undefined,
    related_topics: Array.isArray(related_topics)
      ? related_topics.filter((t) => typeof t === "string")
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Response parser (faithfully ported from classify.ts)
// ---------------------------------------------------------------------------

function parseResponse(response: Anthropic.Messages.Message): ClassifyResult {
  const text = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { categories: ["inbox"], tags: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    // Try new format first (categories array)
    const newResult = parseNewFormat(parsed);
    if (newResult) return newResult;

    // Fallback: old single-category format
    const legacyResult = parseLegacyFormat(parsed);
    if (legacyResult) return legacyResult;

    return { categories: ["inbox"], tags: [] };
  } catch {
    return { categories: ["inbox"], tags: [] };
  }
}

// ---------------------------------------------------------------------------
// Classify functions (text and image)
// ---------------------------------------------------------------------------

/** Smart-sample long text: take beginning + ending for better context */
function smartTruncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const headLen = Math.floor(maxLen * 0.7);
  const tailLen = maxLen - headLen - 20; // 20 for separator
  return text.slice(0, headLen) + "\n\n[...중략...]\n\n" + text.slice(-tailLen);
}

async function classifyText(
  client: Anthropic,
  text: string,
  options?: { maxTokens?: number; userPatterns?: string; userRules?: string; inputType?: string; textLength?: number }
): Promise<ClassifyResult> {
  const meta = options?.inputType
    ? `[입력 유형: ${options.inputType}${options.textLength ? `, 원본 ${options.textLength.toLocaleString()}자` : ""}]\n\n`
    : "";
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: options?.maxTokens ?? 800,
    temperature: 0,
    system: buildSystemPrompt(options?.userPatterns, options?.userRules),
    messages: [{ role: "user", content: meta + text }],
  });
  return parseResponse(response);
}

async function classifyImage(
  client: Anthropic,
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  text?: string,
  options?: { userPatterns?: string; userRules?: string }
): Promise<ClassifyResult> {
  const content: Anthropic.Messages.ContentBlockParam[] = [
    {
      type: "image",
      source: { type: "base64", media_type: mediaType, data: imageBase64 },
    },
  ];

  if (text) {
    content.push({ type: "text", text: `첨부 텍스트: ${text}` });
  } else {
    content.push({ type: "text", text: "이 이미지를 분석하고 분류해주세요." });
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    temperature: 0,
    system: buildSystemPrompt(options?.userPatterns, options?.userRules),
    messages: [{ role: "user", content }],
  });

  return parseResponse(response);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_TEXT_LENGTH = 10_000;
const MAX_PDF_TEXT_LENGTH = 100_000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    // Only allow images from our Supabase storage to prevent SSRF
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (supabaseUrl) {
      const allowed = new URL(supabaseUrl);
      if (parsed.hostname !== allowed.hostname) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Edge Function entry point
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  // Only POST is supported
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // ── Environment ────────────────────────────────────────────────────────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anthropicApiKey) {
    console.error("Missing required environment variables");
    return jsonResponse({ error: "서버 설정 오류입니다." }, 500);
  }

  // Service-role client — bypasses RLS, used for all DB operations.
  // Authentication is done via entry ownership check below.
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // ── Authentication ────────────────────────────────────────────────────
  // Try JWT-based auth first; fall back to entry ownership if JWT is invalid
  // (handles iOS SDK sending anon key instead of user JWT via adapt() race)
  const authHeader = req.headers.get("Authorization");
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const jwt = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(jwt);
    if (user) {
      userId = user.id;
    }
  }

  // ── Parse request body ────────────────────────────────────────────────
  let entry_id: string;
  let bodyUserId: string | undefined;
  try {
    const body = await req.json();
    entry_id = body?.entry_id;
    bodyUserId = body?.user_id;
  } catch {
    return jsonResponse({ error: "요청 본문을 파싱할 수 없습니다." }, 400);
  }

  if (!entry_id || typeof entry_id !== "string") {
    return jsonResponse({ error: "entry_id가 필요합니다." }, 400);
  }

  // ── Fetch entry (service-role, no RLS) ────────────────────────────────
  const { data: entry, error: fetchError } = await supabase
    .from("entries")
    .select("*")
    .eq("id", entry_id)
    .single();

  if (fetchError || !entry) {
    return jsonResponse({ error: "항목을 찾을 수 없습니다." }, 404);
  }

  // Verify ownership: JWT auth or body user_id must match entry owner
  const entryUserId = entry.user_id as string;
  if (userId) {
    // JWT auth succeeded — verify user owns the entry
    if (userId !== entryUserId) {
      return jsonResponse({ error: "권한이 없습니다." }, 403);
    }
  } else {
    // JWT auth failed (e.g., iOS SDK anon key race) — require user_id in body
    // This prevents unauthenticated access: attacker needs both entry_id AND user_id
    if (!bodyUserId || bodyUserId !== entryUserId) {
      return jsonResponse({ error: "인증이 필요합니다." }, 401);
    }
  }
  const effectiveUserId = userId || entryUserId;

  // ── Fetch user classify patterns for personalization ──────────────────
  let userPatterns: string | undefined;
  try {
    const { data: patterns } = await supabase
      .from("user_classify_patterns")
      .select("original_categories, corrected_categories, original_tags, corrected_tags, keyword_context")
      .eq("user_id", effectiveUserId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (patterns && patterns.length > 0) {
      userPatterns = patterns.map((p: Record<string, unknown>) => {
        const parts: string[] = [];
        if (p.original_categories && p.corrected_categories) {
          const kw = (p.keyword_context as string)?.slice(0, 50) || '...';
          parts.push(`"${kw}" → 카테고리: ${(p.original_categories as string[]).join(',')} → ${(p.corrected_categories as string[]).join(',')}`);
        }
        if (p.original_tags && p.corrected_tags) {
          parts.push(`태그: [${(p.original_tags as string[]).join(',')}] → [${(p.corrected_tags as string[]).join(',')}]`);
        }
        return parts.join('; ');
      }).filter(Boolean).join('\n');
    }
  } catch {
    // Non-critical — proceed without patterns
  }

  // ── Fetch user custom rules for priority injection ───────────────────
  let userRules: string | undefined;
  try {
    const { data: rules } = await supabase
      .from("user_classify_rules")
      .select("keyword, category, context")
      .eq("user_id", effectiveUserId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (rules && rules.length > 0) {
      userRules = rules.map((r: Record<string, unknown>) => {
        const ctxDirective = r.context
          ? `, context를 반드시 "${r.context}"로 설정`
          : "";
        return `- "${r.keyword}" 키워드 → 반드시 ${r.category} 포함${ctxDirective}`;
      }).join("\n");
    }
  } catch {
    // Non-critical — proceed without rules
  }

  // ── Classify ──────────────────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

  const entryInputType: string = (entry.input_type as string) || "text";
  let result: ClassifyResult;

  try {
    const rawText: string = (entry.raw_text as string) || "";
    const extractedText: string = (entry.extracted_text as string) || "";
    const imageUrl: string | null = (entry.image_url as string | null) ?? null;

    // Combine raw_text + extracted_text (from on-device OCR) for text classification
    const textToClassify = [rawText, extractedText].filter(Boolean).join("\n\n");

    if (imageUrl && (entryInputType === "image" || entryInputType === "mixed")) {
      // Validate URL
      if (!isAllowedImageUrl(imageUrl)) {
        return jsonResponse({ error: "허용되지 않은 이미지 URL입니다." }, 400);
      }

      // Fetch image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        return jsonResponse({ error: "이미지를 가져올 수 없습니다." }, 400);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const uint8 = new Uint8Array(imageBuffer);
      let binary = "";
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      const base64 = btoa(binary);

      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      const mediaType = (
        ["image/jpeg", "image/png", "image/webp"].includes(contentType) ? contentType : "image/jpeg"
      ) as "image/jpeg" | "image/png" | "image/webp";

      // Truncate long text for classification (full text is already stored in DB)
      const clippedText = smartTruncate(textToClassify, MAX_TEXT_LENGTH);

      result = await classifyImage(anthropic, base64, mediaType, clippedText || undefined, { userPatterns, userRules });
    } else if (textToClassify) {
      // Text-only classification (includes on-device OCR extracted text from iOS)
      const textLimit = entryInputType === "pdf" ? MAX_PDF_TEXT_LENGTH : MAX_TEXT_LENGTH;
      const clippedText = smartTruncate(textToClassify, textLimit);

      const classifyOptions = entryInputType === "pdf"
        ? { userPatterns, userRules, maxTokens: 1500, inputType: "PDF", textLength: textToClassify.length }
        : { userPatterns, userRules, inputType: entryInputType, textLength: textToClassify.length };

      result = await classifyText(anthropic, clippedText, classifyOptions);
    } else {
      return jsonResponse({ error: "분류할 내용이 없습니다." }, 400);
    }
  } catch (err) {
    console.error("Classification error:", err);
    return jsonResponse({ categories: ["inbox"], tags: [], error: "Classification failed" }, 500);
  }

  // For PDF entries: enforce 원칙 B — primary를 knowledge로 강제 교체, schedule은 secondary로 보존.
  // (PDFs are typically reference material; any other primary is replaced.)
  if (entryInputType === "pdf") {
    const hadSchedule = result.categories.includes("schedule");
    result.categories = hadSchedule ? ["knowledge", "schedule"] : ["knowledge"];
  }

  // ── Build update payload ──────────────────────────────────────────────
  const topic =
    result.categories.includes("knowledge") && result.topic
      ? result.topic.trim().toLowerCase()
      : null;

  const updateData: Record<string, unknown> = {
    categories: result.categories,
    tags: result.tags,
    summary: result.summary || null,
    ai_metadata: result,
  };
  // Only update extracted_text for image entries where the AI provides OCR.
  // For PDF/text entries, on-device extraction already stored the full text — don't overwrite.
  if (result.extracted_text && (entryInputType === "image" || entryInputType === "mixed")) {
    updateData.extracted_text = result.extracted_text;
  }
  if (topic) updateData.topic = topic;
  // Preserve existing due_date to prevent relative-date drift across re-classifications.
  // Relative expressions like "다음주 금요일" would otherwise be re-interpreted against the
  // current date on every classify, causing the date to roll forward each week.
  // Only set due_date when the entry has none yet (initial classification).
  if (result.due_date && !entry.due_date) {
    updateData.due_date = result.due_date;
  }
  // Set context for all categories (null when ambiguous)
  updateData.context = result.context ?? null;

  // ── Persist results ───────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from("entries")
    .update(updateData)
    .eq("id", entry_id)
    .eq("user_id", effectiveUserId);

  if (updateError) {
    console.error("Classification update error:", updateError);
    return jsonResponse({ error: "분류 결과 저장에 실패했습니다." }, 500);
  }

  return jsonResponse(result, 200);
});
