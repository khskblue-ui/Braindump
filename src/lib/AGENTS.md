<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Server utilities, auth, classify, Supabase clients with constraints -->

# lib

## Purpose
서버 전용 유틸 + Supabase 클라이언트 팩토리. 인증(JWT Bearer + 쿠키), AI 분류(Claude Haiku), URL 검증, Supabase 클라이언트 지원.

## Key Files

| File | Description |
|------|-------------|
| `auth.ts` | 요청 인증 (Bearer 토큰 + 쿠키-based) |
| `classify.ts` | Claude AI로 엔트리 분류 (텍스트/이미지) |
| `url-validation.ts` | Supabase Storage URL 화이트리스트 검증 |
| `supabase/client.ts` | 클라이언트 측 Supabase 인스턴스 |
| `supabase/server.ts` | 서버 컴포넌트용 Supabase 인스턴스 |
| `supabase/middleware.ts` | Next.js middleware 인증 체크 |
| 기타 (`calendar.ts`, `signed-url.ts` 등) | 보조 유틸 |

---

## File Details

### auth.ts (서버 전용)

**역할:** 모든 API 라우트에서 호출하는 요청 인증 함수.

**Export:**
```typescript
async function requireAuth(req?: NextRequest): Promise<
  { supabase: SupabaseClient; user: User } | 
  { error: NextResponse }
>
```

**동작:**
1. Bearer 토큰 확인 (iOS 앱용)
   ```
   Authorization: Bearer <JWT>
   ```
   → anon_key로 토큰 검증, user 추출

2. 쿠키 기반 인증 (웹용)
   ```
   Cookie: sb-*-auth-token=<JWT>
   ```
   → server Supabase 클라이언트로 세션 확인

3. 실패 시
   ```json
   { error: { status: 401, message: '인증이 필요합니다.' } }
   ```

**사용 예:**
```typescript
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { supabase, user, error } = await requireAuth(req);
  if (error) return error;
  
  const { data } = await supabase.from('entries')
    .select('*')
    .eq('user_id', user.id);
  return NextResponse.json(data);
}
```

**제약 (반복 실수):**
- service_role_key 테스트는 **PostgREST 우회** (RLS 미적용)
- 반드시 anon_key + 실제 JWT로도 검증할 것

---

### classify.ts (서버 전용, Anthropic SDK)

**역할:** Claude Haiku로 엔트리 텍스트/이미지 분류.

**주요 Export:**
```typescript
// 텍스트 분류
async function classifyText(
  text: string,
  options?: {
    maxTokens?: number;
    userPatterns?: string;
    userRules?: string;
    existingTopics?: string;
    inputType?: string;
    textLength?: number;
  }
): Promise<ClassifyResult>

// 이미지 분류
async function classifyImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  text?: string,
  options?: {
    userPatterns?: string;
    userRules?: string;
    existingTopics?: string;
  }
): Promise<ClassifyResult>

// 긴 텍스트 샘플링 (시작 70% + 끝 30%)
function smartTruncate(text: string, maxLen: number): string
```

**ClassifyResult:**
```typescript
interface ClassifyResult {
  categories: EntryCategory[];  // 최대 3개
  tags: string[];               // 최대 5개
  topic?: string;               // knowledge 포함 시만
  extracted_text?: string;      // 이미지에서 추출한 텍스트
  summary?: string;             // 15자 이내 권장
  due_date?: string;            // ISO8601 (KST, +09:00)
  context?: 'personal' | 'work';
  related_topics?: string[];
}
```

**특징:**
- **모델:** Claude Haiku 4.5 (비용 최적화)
- **날짜:** 한국 시간(KST, UTC+9) 기준
- **요일:** 캘린더 기준 (직접 계산 안 함)
- **summary 날짜 보정:** due_date와 summary의 날짜 불일치 자동 수정
- **레거시 호환:** category (string) → categories (array) 자동 변환

**사용 예:**
```typescript
import { classifyText } from '@/lib/classify';

const result = await classifyText(
  '내일 3시에 회의 자료 준비해야 함',
  {
    inputType: 'text',
    existingTopics: '프로젝트명1\n프로젝트명2',
  }
);
// result: { categories: ['schedule', 'task'], due_date: '2026-04-21T15:00:00+09:00', ... }
```

**기술 제약 (CLAUDE.md 참고):**

| 제약 | 원인 | 해결책 |
|------|------|--------|
| `entries.tags` 배열에 `ilike` 불가 | PostgREST 42883 | JS 포스트필터링 |
| `.or()` 내 `::` 캐스트 불가 | PostgREST PGRST100 | OR 조건 분리 |
| 날짜/요일 직접 계산 불가 | 시간대 오류 | 캘린더 참조 + 고정식 |
| 한국어 날짜 해석 모호 | "다음주" 의미 불명확 | 사용자 정의 규칙 우선 |

---

### supabase/client.ts (클라이언트 전용)

**역할:** 클라이언트 JavaScript에서 사용하는 Supabase 인스턴스.

**Export:**
```typescript
function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**특징:**
- 쿠키 기반 세션 관리 (자동으로 요청에 JWT 포함)
- `auth.getUser()`, `auth.onAuthStateChange()` 등 사용 가능
- Zustand 스토어에서 호출

**사용 예:**
```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

---

### supabase/server.ts (서버 컴포넌트 전용)

**역할:** Server Component에서 사용하는 Supabase 인스턴스. cookies() API와 통합.

**Export:**
```typescript
async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { ... },
        setAll() { ... } // Server Component에서 set 불가, 무시
      },
    }
  );
}
```

**특징:**
- `cookies()` 호출이 `await` 필요 (Next.js 16 변경)
- Server Component에서 쿠키 쓰기 불가 (무시됨)
- Middleware에서만 쿠키 설정 가능

**사용 예:**
```typescript
import { createClient } from '@/lib/supabase/server';

async function MyServerComponent() {
  const supabase = await createClient();
  const { data: entries } = await supabase.from('entries').select('*');
  return <div>{entries.length} 엔트리</div>;
}
```

---

### supabase/middleware.ts

**역할:** Next.js middleware에서 인증 상태 체크 + 라우트 보호.

**Export:**
```typescript
async function updateSession(request: NextRequest): Promise<NextResponse>
```

**라우트 규칙:**
| 경로 | 인증 필요 | 동작 |
|------|----------|------|
| `/` | 아니오 | 공개 랜딩 페이지 (인증 시 /home으로) |
| `/login` | 아니오 | 로그인 페이지 |
| `/privacy`, `/guide` | 아니오 | 공개 문서 |
| `/api/*` | 예 | `requireAuth()` 핸들러에서 검증 |
| `/home`, `/settings` | 예 | 인증되지 않으면 /login으로 |

**특징:**
- API 라우트는 middleware 검증 스킵 (핸들러에서 `requireAuth()` 호출)
- 페이지 네비게이션: `getSession()`으로 빠른 로컬 JWT 체크 (네트워크 호출 없음)
- 쿠키 갱신: middleware에서만 수행 (Server Component는 불가)

---

### url-validation.ts

**역할:** Supabase Storage URL 화이트리스트 검증.

**Export:**
```typescript
function isAllowedImageUrl(url: string): boolean {
  // 1. HTTPS 검증
  // 2. Supabase Storage 도메인 검증
  return parsed.protocol === 'https:' && 
         parsed.hostname === supabaseHostname;
}
```

**사용:**
```typescript
// 이미지 src 설정 전 검증
if (!isAllowedImageUrl(imageUrl)) {
  // CSP 위반 → fallback 사용
  imageUrl = defaultImageUrl;
}
```

**제약:**
- 외부 URL(imgur, cloudinary 등) 차단 (CSP 정책)
- signed URL 포함 (Supabase Storage URL)

---

## For AI Agents

### Working In This Directory

**서버 전용 코드:**
모든 파일 상단에 `import 'server-only'` 필수 (Next.js 13+).

```typescript
import 'server-only';
// 이 파일은 서버에서만 임포트 가능
// 클라이언트에서 임포트 시 빌드 오류 발생
```

**환경 변수:**
```bash
# .env.local (로컬 개발)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

### Testing Requirements

**auth.ts 테스트:**
```typescript
// 유효한 Bearer 토큰
const req = new NextRequest('http://localhost/api/test', {
  headers: { 'Authorization': 'Bearer <valid_jwt>' }
});
const { supabase, user } = await requireAuth(req);
expect(user).toBeDefined();

// 쿠키 기반 (웹)
const req2 = new NextRequest('http://localhost/api/test', {
  headers: { 'Cookie': 'sb-...=<valid_jwt>' }
});
const { supabase, user } = await requireAuth(req2);
expect(user).toBeDefined();

// 미인증
const req3 = new NextRequest('http://localhost/api/test');
const { error } = await requireAuth(req3);
expect(error?.status).toBe(401);
```

**classify.ts 테스트:**
```typescript
// 텍스트 분류
const result = await classifyText('내일 회의 자료 준비');
expect(result.categories).toContain('schedule');
expect(result.due_date).toBeDefined();

// 이미지 분류 (base64 mock)
const base64 = 'iVBORw0KGgoAAAANS...';
const result = await classifyImage(base64, 'image/png');
expect(result.categories).toBeDefined();

// 날짜 보정 검증
const result = await classifyText('내일 3시 회의');
// summary 날짜와 due_date 일치 확인
```

**Supabase 클라이언트 테스트:**
```typescript
// Server Component
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
expect(user).toBeDefined();

// 클라이언트 (use client)
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
```

### Common Patterns

**API 라우트에서 인증 + DB 쿼리:**
```typescript
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { supabase, user, error } = await requireAuth(req);
  if (error) return error;

  const { data } = await supabase.from('entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json(data);
}
```

**엔트리 분류:**
```typescript
import { classifyText } from '@/lib/classify';

const result = await classifyText(entryText, {
  userPatterns: userPreviousPatterns,
  userRules: userCustomRules,
  existingTopics: topicsList.join('\n'),
});
```

**라우트 보호 (middleware):**
```typescript
// middleware.ts에서 자동으로 처리
// API 라우트는 requireAuth() 사용
// 페이지는 middleware 리다이렉트
```

## Dependencies

### Internal
- `@/types` — Entry, ClassifyResult, EntryCategory 등
- `@supabase/ssr` — SSR 안전 Supabase 클라이언트

### External
- **@supabase/supabase-js** v2.101
- **@supabase/ssr** v0.x — SSR/middleware 통합
- **@anthropic-ai/sdk** — Claude API
- **zod** — 분류 결과 스키마 검증
- **next/headers** — cookies(), NextRequest/NextResponse

---

## Technical Constraints (lib 작업 시)

### Constraint 1: text[] 배열 검색 불가

**문제:** `entries.tags` 는 `text[]` 배열 타입.

**PostgREST 제약:**
```typescript
// ❌ 작동 안 함 (오류 42883)
const { data } = await supabase
  .from('entries')
  .select('*')
  .filter('tags', 'ilike', '%foo%');  // ilike는 text[] 미지원
```

**해결책 1: JS 포스트필터링**
```typescript
const { data } = await supabase
  .from('entries')
  .select('*')
  .eq('user_id', user.id);
  
// 클라이언트에서 필터
const filtered = data.filter(e => 
  e.tags.some(tag => tag.includes(searchTerm))
);
```

**해결책 2: DB 함수 사용 (성능 우선)**
```sql
-- supabase/migrations/xxx_tag_search.sql
CREATE FUNCTION search_entries_by_tag(
  p_user_id UUID,
  p_tag TEXT
) RETURNS TABLE(id UUID, tags TEXT[], ...) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM entries
  WHERE user_id = p_user_id
  AND tags @> ARRAY[p_tag];
END;
$$ LANGUAGE plpgsql;
```

### Constraint 2: `.or()` 내 `::` 캐스트 불가

**문제:** 복수 조건에서 타입 캐스트.

**❌ 작동 안 함 (오류 PGRST100):**
```typescript
.or('tags::text ilike \'%foo%\',categories->>0 = \'task\'')
```

**해결책: JS에서 OR 로직 구현**
```typescript
const [
  taskEntries,
  taggedEntries,
] = await Promise.all([
  supabase.from('entries').select('*').eq('categories->>0', 'task'),
  // tags 검색은 JS 필터
]);

const combined = [...taskEntries, ...taggedEntries];
const unique = Array.from(new Map(combined.map(e => [e.id, e])).values());
```

### Constraint 3: service_role_key 테스트 후 anon_key 검증

**문제:** service_role_key는 RLS 정책을 무시.

**❌ 부정확한 테스트:**
```typescript
const supabase = createClient(URL, SERVICE_ROLE_KEY);
// RLS가 미적용되므로 모든 데이터 접근 가능
// 실제 사용자는 접근 불가
```

**✅ 올바른 테스트:**
```typescript
// 1. service_role_key로 테스트 데이터 생성
const adminSupabase = createClient(URL, SERVICE_ROLE_KEY);
await adminSupabase.from('entries').insert([...]);

// 2. anon_key + 실제 JWT로 검증
const userSupabase = createClient(URL, ANON_KEY);
const token = await login('user@example.com', 'password');
userSupabase.headers.set('Authorization', `Bearer ${token}`);
const { data } = await userSupabase.from('entries').select('*');
expect(data).toBeDefined();
```

---

**세부 가이드:** `../AGENTS.md`의 Technical Constraints 섹션 참고
