// ---------------------------------------------------------------------------
// Plan v3 Step 7 — classify 원칙 A/B/C/D 로컬 검증 스크립트
//
// 실행:
//   1. .env.local 의 ANTHROPIC_API_KEY 를 현재 쉘에 export (또는 --env-file 사용)
//   2. cd /Users/khs/Desktop/braindump
//   3. deno run --allow-env --allow-net --env-file=.env.local tests/classify/test_cases.ts
//
// 목표: 13개 TC 전부 expect 와 일치 (TC14 는 PDF primary 강제 교체 — 배포 후 smoke)
// 모델: claude-haiku-4-5-20251001, temperature: 0
// 위치: supabase/functions 외부 (Edge Function 번들 제외 — MF-C4)
// ---------------------------------------------------------------------------

// Neutralize Deno.serve BEFORE importing index.ts so the Edge Function entry
// point doesn't spin up an HTTP listener during tests.
// deno-lint-ignore no-explicit-any
(Deno as any).serve = (..._args: unknown[]) => ({
  finished: Promise.resolve(),
  shutdown: async () => {},
  ref: () => {},
  unref: () => {},
});

import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";
import { buildSystemPrompt } from "../../supabase/functions/classify/index.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CategoryValue = "task" | "idea" | "memo" | "knowledge" | "schedule" | "inbox";

interface ExpectedResult {
  categories: CategoryValue[];
  due_date_present?: boolean; // true=ISO 날짜 존재, false=null/undefined, undefined=검증 안 함
}

interface TestCase {
  id: string;
  description: string;
  input: string;
  expected: ExpectedResult;
}

interface ActualResult {
  categories: CategoryValue[];
  due_date?: string | null;
  summary?: string;
  rawJson: string;
}

// ---------------------------------------------------------------------------
// Test cases (Plan v3 Step 7 기반)
// ---------------------------------------------------------------------------

const CASES: TestCase[] = [
  // --- 원칙 A: 한 Entry = 한 primary ---
  {
    id: "TC1",
    description: "원칙 A — 단일 task 유지",
    input: "A사 견적 팀장님 보고",
    expected: { categories: ["task"], due_date_present: false },
  },
  {
    id: "TC2",
    description: "원칙 A — '보고서' 명사 때문에 memo 붙이지 말 것",
    input: "보고서 쓰기",
    expected: { categories: ["task"], due_date_present: false },
  },
  {
    id: "TC3",
    description: "원칙 D — 회의록 작성은 task 단일, memo 추가 금지",
    input: "회의록 작성하기",
    expected: { categories: ["task"], due_date_present: false },
  },

  // --- 원칙 B/C: 날짜 소유 구분 ---
  {
    id: "TC4",
    description: "원칙 B — 내일 3시가 준비 Action 마감 → task+schedule",
    input: "내일 3시 팀 미팅 자료 준비",
    expected: { categories: ["task", "schedule"], due_date_present: true },
  },
  {
    id: "TC5",
    description: "원칙 C — 4/30 은 출고 일정 속성, 공유 Action 속성 아님 → task 단일",
    input: "4/30 출고 일정 사전 공유하기",
    expected: { categories: ["task"], due_date_present: false },
  },
  {
    id: "TC6",
    description: "원칙 C — 2/15 는 면접 속성, 공유 Action 속성 아님 → task 단일",
    input: "2/15 면접 일정 공유",
    expected: { categories: ["task"], due_date_present: false },
  },
  {
    id: "TC7",
    description: "원칙 C — 4/30 이 보고 Action 마감 → task+schedule",
    input: "4/30에 보고하기",
    expected: { categories: ["task", "schedule"], due_date_present: true },
  },

  // --- idea / memo / knowledge 경계 ---
  {
    id: "TC8",
    description: "idea — 아직 열린 생각",
    input: "앱에 다크모드 넣으면 좋겠다",
    expected: { categories: ["idea"], due_date_present: false },
  },
  {
    id: "TC9",
    description: "memo — 질문/궁금증만 (knowledge 아님)",
    input: "미토콘드리아 관련 질병이 뭐가 있지?",
    expected: { categories: ["memo"], due_date_present: false },
  },
  {
    id: "TC10",
    description: "knowledge — 답을 담은 사실 진술",
    input: "미토콘드리아는 세포의 에너지를 생산하는 소기관이다",
    expected: { categories: ["knowledge"], due_date_present: false },
  },

  // --- categories 길이 / 플레이스홀더 반영 확인 ---
  {
    id: "TC11",
    description: "원칙 A — 계약서 '검토' task, memo/knowledge 추가 금지",
    input: "B법인 계약서 검토",
    expected: { categories: ["task"], due_date_present: false },
  },
  {
    id: "TC12",
    description: "원칙 A — 샘플 '발송' 단일 task",
    input: "C연구소 샘플 발송",
    expected: { categories: ["task"], due_date_present: false },
  },

  // --- 복합 케이스 (원칙 B 의 ✅ 예시 재검증) ---
  {
    id: "TC13",
    description: "원칙 B ✅ — 내일 오후 2시 미팅 자료 준비는 task+schedule",
    input: "내일 오후 2시 디자인팀 미팅 자료 준비",
    expected: { categories: ["task", "schedule"], due_date_present: true },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJsonBlock(text: string): Record<string, unknown> | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function matchesExpected(actual: ActualResult, expected: ExpectedResult): boolean {
  if (!arraysEqual(actual.categories, expected.categories)) return false;
  if (expected.due_date_present !== undefined) {
    const hasDate = typeof actual.due_date === "string" && actual.due_date.length > 0;
    if (hasDate !== expected.due_date_present) return false;
  }
  return true;
}

async function runCase(
  client: Anthropic,
  systemPrompt: string,
  tc: TestCase,
): Promise<ActualResult> {
  const resp = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: "user", content: tc.input }],
  });

  const text = resp.content
    .filter((b: { type: string }): b is { type: "text"; text: string } => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");

  const parsed = parseJsonBlock(text);
  if (!parsed) {
    return { categories: ["inbox"], due_date: null, summary: "", rawJson: text };
  }

  const cats = Array.isArray(parsed.categories)
    ? (parsed.categories as unknown[]).filter(
        (v): v is CategoryValue => typeof v === "string",
      )
    : [];
  const dueDate = typeof parsed.due_date === "string" ? parsed.due_date : null;
  const summary = typeof parsed.summary === "string" ? parsed.summary : "";

  return { categories: cats, due_date: dueDate, summary, rawJson: text };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.error("[FATAL] ANTHROPIC_API_KEY 환경변수가 없습니다.");
    console.error("해결: deno run --allow-env --allow-net --env-file=.env.local tests/classify/test_cases.ts");
    Deno.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt();

  console.log("# classify 원칙 검증 결과 (Plan v3 Step 7)\n");
  console.log(`- 모델: claude-haiku-4-5-20251001`);
  console.log(`- temperature: 0`);
  console.log(`- 총 TC: ${CASES.length}`);
  console.log(`- 실행 시각: ${new Date().toISOString()}\n`);

  console.log("## 결과 표\n");
  console.log("| TC | 입력 | 기대 categories | 기대 due_date | 실제 categories | 실제 due_date | 일치 |");
  console.log("|----|------|----------------|---------------|-----------------|---------------|------|");

  const results: Array<{ tc: TestCase; actual: ActualResult; pass: boolean }> = [];

  for (const tc of CASES) {
    try {
      const actual = await runCase(client, systemPrompt, tc);
      const pass = matchesExpected(actual, tc.expected);
      results.push({ tc, actual, pass });

      const expCats = JSON.stringify(tc.expected.categories);
      const expDue =
        tc.expected.due_date_present === true
          ? "있음"
          : tc.expected.due_date_present === false
            ? "없음"
            : "—";
      const actCats = JSON.stringify(actual.categories);
      const actDue = actual.due_date ? "있음" : "없음";
      const mark = pass ? "✅" : "❌";
      const shortInput = tc.input.length > 30 ? tc.input.slice(0, 28) + "…" : tc.input;

      console.log(
        `| ${tc.id} | ${shortInput} | ${expCats} | ${expDue} | ${actCats} | ${actDue} | ${mark} |`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        tc,
        actual: { categories: ["inbox"], due_date: null, summary: "", rawJson: `ERROR: ${msg}` },
        pass: false,
      });
      console.log(
        `| ${tc.id} | ${tc.input.slice(0, 28)} | ${JSON.stringify(tc.expected.categories)} | ? | ERROR | ? | ❌ |`,
      );
      console.error(`  [${tc.id}] API 오류: ${msg}`);
    }
  }

  const passCount = results.filter((r) => r.pass).length;
  const failCount = results.length - passCount;

  console.log(`\n## 요약\n`);
  console.log(`- ✅ 통과: ${passCount} / ${results.length}`);
  console.log(`- ❌ 실패: ${failCount} / ${results.length}`);

  if (failCount > 0) {
    console.log(`\n## 실패 케이스 상세\n`);
    for (const r of results) {
      if (r.pass) continue;
      console.log(`### ${r.tc.id} — ${r.tc.description}`);
      console.log(`- 입력: \`${r.tc.input}\``);
      console.log(`- 기대 categories: \`${JSON.stringify(r.tc.expected.categories)}\``);
      console.log(
        `- 기대 due_date: ${
          r.tc.expected.due_date_present === true
            ? "있음"
            : r.tc.expected.due_date_present === false
              ? "없음"
              : "—"
        }`,
      );
      console.log(`- 실제 categories: \`${JSON.stringify(r.actual.categories)}\``);
      console.log(`- 실제 due_date: \`${r.actual.due_date ?? "null"}\``);
      console.log(`- 실제 summary: \`${r.actual.summary}\``);
      console.log(`- 원본 JSON:\n\`\`\`json\n${r.actual.rawJson.slice(0, 500)}\n\`\`\`\n`);
    }
  }

  Deno.exit(failCount === 0 ? 0 : 1);
}

if (import.meta.main) {
  await main();
}
