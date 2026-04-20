<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Core source layout overview for web platform -->

# src

## Purpose
BrainDump 웹 애플리케이션의 전체 소스 코드. Next.js 16 기반의 풀스택 앱(React 19 컴포넌트, API 라우트, 서버 사이드 로직)과 클라이언트 전역 상태(Zustand), 공유 타입 정의, Supabase 클라이언트 유틸로 구성. iOS 앱과 서버 로직을 공유.

## Key Files (src 최상위)
| File | Description |
|------|-------------|
| (각 서브디렉토리 참조) | 아래 Subdirectories 섹션 참고 |

## Subdirectories

### `app/` (Next.js App Router)
**React 컴포넌트 페이지 + API 라우트의 라우팅 루트.**

핵심 구조:
- `(landing)/` — 인증 전 공개 페이지 (랜딩, 가이드)
- `(main)/` — 인증 후 보호된 페이지들 (홈, 설정, 분류 규칙)
- `auth/callback` — Supabase OAuth 리다이렉트
- `api/` — API 라우트 (엔트리 CRUD, 분류, 태그, 주제, 정렬, 휴지통, 설정 등)

특징:
- `layout.tsx` — 루트 레이아웃 (Auth 초기화, PWA manifest 로드)
- 모든 API 라우트는 `requireAuth()`로 JWT 인증 검증
- `text[]` 배열 필터링은 JS 포스트필터링 사용 (PostgREST ilike 제약)

### `stores/` (Zustand 전역 상태)
**3개 스토어. Persist + hydration 패턴.**

| Store | Purpose | Persist |
|-------|---------|---------|
| `auth-store.ts` | 사용자 인증 상태 (OAuth, 비밀번호) | 없음 |
| `entry-store.ts` | 엔트리 목록, 필터, 페이지네이션, CRUD, 분류, 소팅 | 있음 (앞 20개만 + signed URL 제거) |
| `offline-store.ts` | 오프라인 큐 (sync on online) | 있음 |

중요 패턴:
- `entry-store`: 새 카드 5초 pinning + classification done 플래그로 순서 관리
- `offline-store`: 네트워크 복구 시 자동 동기화
- AbortController로 stale fetch 취소

### `lib/` (서버/공유 유틸)
**Supabase 클라이언트, auth, classify, URL validation.**

자세한 문서는 `lib/AGENTS.md` 참고.

### `types/` (공유 타입)
**Entry, ClassifyResult, Category 등 공유 인터페이스.**

자세한 문서는 `types/AGENTS.md` 참고.

### `components/` (React 컴포넌트)
**shadcn/ui 기반 UI 컴포넌트들. 본 문서 범위 외.**

## For AI Agents

### 🚨 Critical Rules (src 작업 시)

1. **Supabase text[] 배열 필터링**
   - `entries.tags` 는 `text[]` 타입
   - PostgREST `.or()` 내 `::` 캐스트 불가 (PGRST100)
   - `text[]` 컬럼에 `ilike` 직접 사용 불가 (42883)
   - **해결책**: JS 포스트필터링 또는 DB 함수 사용
   - 예: `/api/entries?tag=xyz` → 서버에서 모든 엔트리 fetch 후 JS filter

2. **Zustand persist + hydration**
   - `entry-store`는 캐시된 20개만 저장 (signed URL은 strip)
   - `onRehydrateStorage`에서 마이그레이션 처리 (category string → categories array)
   - `_hydrated` 플래그로 캐시 완료 확인

3. **새 엔트리 5초 pinning**
   - 생성 직후 5초 동안 맨 위에 고정
   - 분류 완료 후 서버 순서 적용
   - 타이머 핸들 저장으로 조기 삭제 시 leak 방지

4. **API 라우트 인증**
   - 모든 라우트는 `requireAuth(req)` 호출
   - Bearer 토큰(iOS) + Cookie(웹) 모두 지원
   - 401 반환 시 클라이언트는 로그인 페이지로 redirect

5. **서버 전용 코드**
   - `import 'server-only'` 필수 (`classify.ts`, `auth.ts`, `/api/*`)
   - 클라이언트에서 실수로 import 방지

### Working In This Directory

**개발 서버:**
```bash
npm run dev
```
기본 http://localhost:3000 (3000 점유 시 3001)

**타입체크:**
```bash
npx tsc --noEmit
```

**린트:**
```bash
npm run lint
```

### Testing Requirements

1. **API 라우트 변경:**
   - anon_key + 실제 세션(쿠키 또는 Bearer 토큰)으로 수동 검증
   - 401 응답 확인 (미인증)
   - 200 + 데이터 확인 (인증 후)

2. **Zustand persist:**
   - 개발자 도구에서 localStorage 확인 (`braindump-*` 키)
   - 페이지 새로고침 후 상태 복구 확인
   - 마이그레이션 로직 동작 확인

3. **배열 필터링:**
   - JS 포스트필터링 쿼리 결과 정확성 검증
   - 대규모 데이터셋(100+) 성능 확인

### Common Patterns

**경로 alias:**
```typescript
import { Entry } from '@/types';           // src/types/index.ts
import { useAuthStore } from '@/stores';    // src/stores/auth-store.ts
import { createClient } from '@/lib/supabase/client'; // src/lib/supabase/client.ts
```

**서버 컴포넌트에서 Supabase:**
```typescript
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
const { data: entries } = await supabase.from('entries').select('*');
```

**클라이언트 컴포넌트에서 Zustand:**
```typescript
'use client';
import { useEntryStore } from '@/stores/entry-store';
const { entries, fetchEntries } = useEntryStore();
```

**API 라우트 인증:**
```typescript
import { requireAuth } from '@/lib/auth';
const { supabase, user, error } = await requireAuth(req);
if (error) return error;
```

## Dependencies

### Internal (src 내부 참조)
- `src/types/` — Entry, ClassifyResult, Category 등
- `src/lib/` — Supabase 클라이언트, auth, classify, URL validation
- `src/stores/` — 전역 상태 (auth, entry, offline)

### External
- **@supabase/supabase-js** v2.101 — Auth, DB, Storage 클라이언트
- **@anthropic-ai/sdk** — AI 분류 (classify.ts)
- **zustand** v5 — 상태 관리
- **sonner** — 토스트 알림
- **pdfjs-dist** — PDF 텍스트 추출 (클라이언트)
- **sharp** — 서버 이미지 변환 (API 라우트)
- **framer-motion** — 애니메이션

## Technical Constraints (반복 실수 방지)

### Supabase / PostgREST

**제약 1: text[] 배열 검색**
- `text[]` 컬럼(`entries.tags`)에 `ilike` 직접 사용 불가 (오류 42883)
- 예: `tags->>0 ilike 'foo'` ← 작동 안 함
- 해결: JS 포스트필터링
  ```typescript
  const { data } = await supabase.from('entries').select('*');
  const filtered = data.filter(e => e.tags.some(t => t.includes(searchTerm)));
  ```

**제약 2: `.or()` 내 `::` 캐스트**
- PostgREST `.or()` 필터 내에서 타입 캐스트 불가 (오류 PGRST100)
- 예: `.or('tags::text ilike \'%foo%\'')` ← 작동 안 함
- 해결: `.or()` 외부에서 처리하거나 DB 함수 사용

**제약 3: service_role_key 테스트**
- service_role_key를 사용한 테스트는 **PostgREST를 우회**
- RLS 정책이 적용 안 됨 (모든 데이터 접근 가능)
- **반드시** anon_key + 실제 JWT로도 검증할 것

### Next.js 16

**제약 4: API route HMR**
- `src/app/api/*` 변경이 핫 리로드되지 않을 수 있음
- 해결: `.next` 삭제 후 `npm run dev` 재시작

**제약 5: 서버 컴포넌트에서 set cookie**
- Server Component에서 `cookieStore.set()` 호출 불가
- 해결: middleware에서 처리 (`lib/supabase/middleware.ts`)

### 플랫폼 공유 규칙

**제약 6: iOS 동시 적용**
- `src/lib/*`, `src/app/api/*` 변경은 iOS에도 즉시 영향
- 서버 사이드 로직 변경 시 iOS 쪽 대응 필요 여부 판단 필수
- UI 전용 변경(`src/components/*`, 페이지 레이아웃)은 웹만 영향

---

**세부 가이드:**
- `stores/AGENTS.md` — Zustand 스토어, persist, hydration 패턴
- `lib/AGENTS.md` — Supabase 클라이언트, auth, classify, URL validation
- `types/AGENTS.md` — Entry, ClassifyResult, 카테고리 정의
