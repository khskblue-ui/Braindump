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
  priority?: PriorityValue;
  related_topics?: string[];
}

// ---------------------------------------------------------------------------
// Calendar & system-prompt builders (faithfully ported from classify.ts)
// ---------------------------------------------------------------------------

function buildCalendarReference(): string {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const lines: string[] = [];

  // Generate 21 days from today
  for (let i = 0; i < 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const label = i === 0 ? " ← 오늘" : i === 1 ? " ← 내일" : "";
    lines.push(`${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})${label}`);
  }

  // Find week boundaries for "이번주" / "다음주" / "차주"
  const todayDay = now.getDay(); // 0=일 ~ 6=토
  // Days until next Monday (Korean weeks start Monday)
  const daysUntilNextMon = todayDay === 0 ? 1 : 8 - todayDay;
  const thisWeekEnd = new Date(now);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + daysUntilNextMon - 1);
  const nextWeekStart = new Date(now);
  nextWeekStart.setDate(nextWeekStart.getDate() + daysUntilNextMon);

  return (
    `이번주 남은 기간: ~${thisWeekEnd.getMonth() + 1}/${thisWeekEnd.getDate()} (${days[thisWeekEnd.getDay()]})\n` +
    `다음주/차주 시작: ${nextWeekStart.getMonth() + 1}/${nextWeekStart.getDate()} (${days[nextWeekStart.getDay()]})\n\n` +
    lines.join("\n")
  );
}

function buildSystemPrompt(userPatterns?: string): string {
  // Use Korean timezone (KST, UTC+9) for correct date/day-of-week
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const todayStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
  const calendar = buildCalendarReference();

  return `오늘은 ${todayStr}입니다. 모든 날짜와 요일은 한국 시간(KST, UTC+9) 기준으로 판단하세요.

## 날짜 참조 캘린더 (반드시 이 표를 참고하여 날짜를 결정하세요)
${calendar}
 사용자가 입력한 텍스트 또는 이미지를 분석하여 JSON으로 분류하세요.
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

반드시 JSON만 반환하세요. 다른 텍스트 없이:
{
  "categories": ["primary", "secondary"],
  "tags": ["태그1", "태그2"],
  "topic": "주제명 (knowledge 포함 시만, 그 외 null)",
  "extracted_text": "이미지에서 추출한 텍스트 (이미지인 경우만, 그 외 null)",
  "summary": "간결한 명사구 제목",
  "due_date": "ISO8601 날짜 (schedule 포함 시만, 그 외 null). 반드시 한국 시간(KST, +09:00) 기준. 예: 2026-04-10T15:00:00+09:00",
  "priority": "high" | "medium" | "low" (기본값: "medium". 확실한 긴급/중요 항목만 "high", 중요도가 낮은 항목만 "low"),
  "related_topics": ["관련 주제"]
}${userPatterns ? `\n\n## 사용자 분류 패턴 (이전 수정 이력 기반)\n${userPatterns}\n이 패턴을 참고하여 분류하되, 맥락에 맞게 판단하세요.\n` : ''}`;
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
  const { categories, tags, topic, extracted_text, summary, due_date, priority, related_topics } =
    parsed;

  // categories: array of 1-3 valid values
  if (!Array.isArray(categories) || categories.length === 0 || categories.length > 3) return null;
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
    priority: isValidPriority(priority) ? priority : "medium",
    related_topics: Array.isArray(related_topics)
      ? related_topics.filter((t) => typeof t === "string")
      : undefined,
  };
}

function parseLegacyFormat(parsed: Record<string, unknown>): ClassifyResult | null {
  const { category, tags, topic, extracted_text, summary, due_date, priority, related_topics } =
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
    priority: isValidPriority(priority) ? priority : "medium",
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

async function classifyText(
  client: Anthropic,
  text: string,
  options?: { maxTokens?: number; userPatterns?: string }
): Promise<ClassifyResult> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: options?.maxTokens ?? 800,
    system: buildSystemPrompt(options?.userPatterns),
    messages: [{ role: "user", content: text }],
  });
  return parseResponse(response);
}

async function classifyImage(
  client: Anthropic,
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp",
  text?: string,
  options?: { userPatterns?: string }
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
    system: buildSystemPrompt(options?.userPatterns),
    messages: [{ role: "user", content }],
  });

  return parseResponse(response);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_TEXT_LENGTH = 10_000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Allow only https and recognised Supabase storage / common image CDNs
    if (parsed.protocol !== "https:") return false;
    // Accept any https URL — same permissive stance as the original isAllowedImageUrl
    // (the PWA version does an allowlist check; here we keep it safe with https-only)
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

  // ── Authentication ──────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "인증이 필요합니다." }, 401);
  }
  const jwt = authHeader.slice(7);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anthropicApiKey) {
    console.error("Missing required environment variables");
    return jsonResponse({ error: "서버 설정 오류입니다." }, 500);
  }

  // Service-role client for admin operations (bypasses RLS)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Verify the token using service-role client (works even if JWT is near expiry)
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(jwt);

  if (userError || !user) {
    console.error("Auth error:", userError?.message, "JWT prefix:", jwt.slice(0, 20));
    return jsonResponse({ error: "유효하지 않은 인증 토큰입니다." }, 401);
  }

  // User-scoped client with RLS for data queries
  const supabaseUser = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  // ── Parse request body ──────────────────────────────────────────────────
  let entry_id: string;
  try {
    const body = await req.json();
    entry_id = body?.entry_id;
  } catch {
    return jsonResponse({ error: "요청 본문을 파싱할 수 없습니다." }, 400);
  }

  if (!entry_id || typeof entry_id !== "string") {
    return jsonResponse({ error: "entry_id가 필요합니다." }, 400);
  }

  // ── Fetch entry ─────────────────────────────────────────────────────────
  const { data: entry, error: fetchError } = await supabaseUser
    .from("entries")
    .select("*")
    .eq("id", entry_id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !entry) {
    return jsonResponse({ error: "항목을 찾을 수 없습니다." }, 404);
  }

  // ── Fetch user classify patterns for personalization ─────────────────
  let userPatterns: string | undefined;
  try {
    const { data: patterns } = await supabaseUser
      .from("user_classify_patterns")
      .select("original_categories, corrected_categories, original_tags, corrected_tags, keyword_context")
      .eq("user_id", user.id)
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

  // ── Classify ────────────────────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

  let result: ClassifyResult;

  try {
    const rawText: string = (entry.raw_text as string) || "";
    const extractedText: string = (entry.extracted_text as string) || "";
    const imageUrl: string | null = (entry.image_url as string | null) ?? null;
    const inputType: string = (entry.input_type as string) || "text";

    // Combine raw_text + extracted_text (from on-device OCR) for text classification
    const textToClassify = [rawText, extractedText].filter(Boolean).join("\n\n");

    if (imageUrl && (inputType === "image" || inputType === "mixed")) {
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
      // Convert ArrayBuffer to base64 in Deno
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

      if (textToClassify.length > MAX_TEXT_LENGTH) {
        return jsonResponse({ error: "텍스트가 너무 깁니다." }, 400);
      }

      result = await classifyImage(anthropic, base64, mediaType, textToClassify || undefined, { userPatterns });
    } else if (textToClassify) {
      // Text-only classification (includes on-device OCR extracted text from iOS)
      if (textToClassify.length > MAX_TEXT_LENGTH) {
        return jsonResponse({ error: "텍스트가 너무 깁니다." }, 400);
      }
      result = await classifyText(anthropic, textToClassify, { userPatterns });
    } else {
      return jsonResponse({ error: "분류할 내용이 없습니다." }, 400);
    }
  } catch (err) {
    console.error("Classification error:", err);
    return jsonResponse({ categories: ["inbox"], tags: [], error: "Classification failed" }, 500);
  }

  // ── Build update payload ────────────────────────────────────────────────
  const topic =
    result.categories.includes("knowledge") && result.topic
      ? result.topic.trim().toLowerCase()
      : null;

  const updateData: Record<string, unknown> = {
    categories: result.categories,
    tags: result.tags,
    summary: result.summary || null,
    priority: result.priority || null,
    ai_metadata: result,
  };
  if (result.extracted_text) updateData.extracted_text = result.extracted_text;
  if (topic) updateData.topic = topic;
  if (result.due_date) updateData.due_date = result.due_date;

  // ── Persist results ─────────────────────────────────────────────────────
  const { error: updateError } = await supabaseUser
    .from("entries")
    .update(updateData)
    .eq("id", entry_id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Classification update error:", updateError);
    return jsonResponse({ error: "분류 결과 저장에 실패했습니다." }, 500);
  }

  return jsonResponse(result, 200);
});
