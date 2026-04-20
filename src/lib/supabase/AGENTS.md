<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Supabase client instances for different contexts (browser/server/middleware) -->

# lib/supabase

## Purpose
Next.js 환경에서 Supabase 클라이언트를 올바른 컨텍스트(browser/server/middleware)에 맞춰 초기화. 각 인스턴스는 쿠키 관리, JWT 자동 갱신, 세션 추적을 담당.

## Key Files

| File | Context | Purpose |
|------|---------|---------|
| `client.ts` | 클라이언트 (`'use client'`) | 브라우저 JavaScript, Zustand 스토어 |
| `server.ts` | 서버 (Server Component) | `async` Server Component, 서버 함수 |
| `middleware.ts` | Middleware (edge) | Next.js middleware, 요청 처리 전 인증 체크 |

---

## File Details

### client.ts

**역할:** 클라이언트 JavaScript에서만 사용되는 Supabase 브라우저 클라이언트.

**코드:**
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**특징:**
- `createBrowserClient` — SSR 안전 (localStorage/쿠키 자동 관리)
- JWT 자동 갱신 (세션 활성 중)
- 쿠키에서 자동으로 JWT 로드
- `auth.getUser()`, `auth.onAuthStateChange()` 사용 가능

**사용 예시:**

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';

export function AuthInitializer() {
  useEffect(() => {
    const supabase = createClient();
    
    // 세션 구독 (로그인 변화 감지)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        useAuthStore.setState({ user: session?.user ?? null });
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
}
```

**제약:**
- 서버 컴포넌트에서 사용 금지 (`'use client'` 필수)
- `cookies()` 직접 접근 불가 (브라우저 API만 가능)

---

### server.ts

**역할:** Server Component + 서버 함수에서 사용하는 Supabase 인스턴스. 쿠키 저장소와 통합.

**코드:**
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서는 set 불가 — 무시
          }
        },
      },
    }
  );
}
```

**특징:**
- `async` 함수 (Next.js 16에서 `cookies()` 호출이 async)
- 쿠키 자동 읽기 (요청 헤더에서)
- 쿠키 쓰기 시도 → 무시 (Server Component 제약)
- JWT 세션 자동 복구

**사용 예시:**

```typescript
import { createClient } from '@/lib/supabase/server';

// Server Component
async function EntriesList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <LoginPrompt />;
  }
  
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  return <div>{entries?.length} 엔트리</div>;
}
```

**쿠키 쓰기 제약:**
```typescript
const supabase = await createClient();

// ❌ Server Component에서 쿠키 쓰기 불가
// 다음 코드는 무시됨:
const { error } = await supabase.auth.signUp({ ... });
// Set-Cookie 헤더 설정 안 됨

// ✅ 쿠키 쓰기가 필요하면 middleware 사용
// (updateSession 함수 참고)
```

---

### middleware.ts

**역할:** Next.js middleware에서 인증 상태 확인 + 쿠키 갱신 + 라우트 보호.

**코드:**
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 라우트별 규칙
  const pathname = request.nextUrl.pathname;
  const isLanding = pathname === '/';
  const isAuthPage = pathname.startsWith('/login');
  const isPublicPage = pathname.startsWith('/privacy') || pathname.startsWith('/guide');
  const isApiRoute = pathname.startsWith('/api');

  // API 라우트: middleware 스킵, 핸들러에서 requireAuth() 호출
  if (isApiRoute) {
    return supabaseResponse;
  }

  // 페이지 네비게이션: 빠른 로컬 JWT 체크 (네트워크 호출 없음)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // 규칙 1: 인증된 사용자가 랜딩/로그인 페이지 접근 → /home으로
  if (user && (isLanding || isAuthPage)) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // 규칙 2: 랜딩 페이지는 공개
  if (isLanding) {
    return supabaseResponse;
  }

  // 규칙 3: 공개 페이지(privacy, guide)는 인증 불필요
  if (isPublicPage) {
    return supabaseResponse;
  }

  // 규칙 4: 미인증 사용자 → 로그인 페이지로
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**호출 위치:**

```typescript
// middleware.ts (프로젝트 루트 src/)
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
```

**특징:**
- **Middleware 컨텍스트:** Edge Function (빠름, 낮은 지연시간)
- **쿠키 갱신:** 유일하게 쿠키 쓰기 가능한 곳
- **JWT 자동 갱신:** Supabase가 만료된 JWT 감지 → 새 토큰 발급
- **API 라우트 제외:** API는 각 핸들러에서 `requireAuth()` 호출
- **라우트 보호:** 페이지 네비게이션만 처리

**라우트 규칙:**

| 경로 | 인증 필요 | 처리 |
|------|----------|------|
| `/` | 아니오 | 공개 (인증 시 /home으로) |
| `/login` | 아니오 | 로그인 페이지 (인증 시 /home으로) |
| `/privacy` | 아니오 | 공개 페이지 |
| `/guide` | 아니오 | 공개 페이지 |
| `/api/*` | 예 | middleware 스킵 (핸들러에서 검증) |
| `/home` | 예 | 미인증 시 /login으로 |
| `/settings/*` | 예 | 미인증 시 /login으로 |

**API 라우트 검증:**

```typescript
// API 라우트 핸들러에서는 requireAuth() 사용
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { supabase, user, error } = await requireAuth(req);
  if (error) return error;  // 401 반환
  
  // ... 처리
}
```

---

## For AI Agents

### Working In This Directory

**클라이언트 vs 서버 선택:**

```typescript
// ❌ 잘못된 사용
import { createClient } from '@/lib/supabase/server';
export default function MyClientComponent() {
  // 'use client' 없이 await createClient() → 오류
}

// ✅ 클라이언트 컴포넌트
'use client';
import { createClient } from '@/lib/supabase/client';
export default function MyClientComponent() {
  const supabase = createClient();
  // OK
}

// ✅ Server Component
import { createClient } from '@/lib/supabase/server';
export default async function MyServerComponent() {
  const supabase = await createClient();
  // OK
}
```

### Testing Requirements

**클라이언트 인스턴스:**
```typescript
// Jest 또는 Vitest with browser environment
test('should initialize Supabase client', () => {
  const supabase = createClient();
  expect(supabase).toBeDefined();
  expect(supabase.auth).toBeDefined();
});
```

**서버 인스턴스:**
```typescript
// Node.js 환경 (cookies 모의)
import { cookies } from 'next/headers';
jest.mock('next/headers', () => ({
  cookies: async () => new Map(), // 모의 쿠키 저장소
}));

test('should create server client', async () => {
  const supabase = await createClient();
  expect(supabase).toBeDefined();
});
```

**Middleware:**
```typescript
// Edge middleware 테스트
test('should redirect unauthenticated user', async () => {
  const request = new NextRequest(
    new URL('/home', 'http://localhost:3000'),
    { cookies: {} }
  );
  
  const response = await updateSession(request);
  expect(response.status).toBe(307); // redirect
  expect(response.headers.get('location')).toContain('/login');
});
```

### Common Patterns

**Server Component에서 사용자 조회:**
```typescript
import { createClient } from '@/lib/supabase/server';

async function MyComponent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return <div>로그인 필요</div>;
  
  return <div>안녕하세요, {user.email}</div>;
}
```

**클라이언트 컴포넌트에서 데이터 fetch:**
```typescript
'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function EntryList() {
  const [entries, setEntries] = useState([]);
  
  useEffect(() => {
    const supabase = createClient();
    
    supabase.from('entries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setEntries(data || []));
  }, []);
  
  return <div>{entries.map(e => <div key={e.id}>{e.raw_text}</div>)}</div>;
}
```

**Middleware 라우트 추가:**
```typescript
// src/middleware.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)' // 기본
  ],
};
```

---

## Dependencies

### Internal
- `@/lib/auth` — `requireAuth()` (API 라우트용)

### External
- **@supabase/ssr** v0.x — SSR 안전 클라이언트
- **@supabase/supabase-js** v2.101 — Supabase JS SDK
- **next/headers** — Server Component cookies() API
- **next/server** — NextRequest, NextResponse, middleware

---

## Technical Notes

### 쿠키 관리 흐름

```
1. 클라이언트 (client.ts)
   → fetch 요청 + Authorization 헤더
   → 브라우저 자동으로 쿠키 포함
   
2. Middleware (middleware.ts)
   → request.cookies에서 쿠키 읽음
   → 필요시 응답 헤더에 Set-Cookie 추가
   → 브라우저에 새 쿠키 설정
   
3. Server Component (server.ts)
   → 요청 쿠키 읽음
   → ✗ 쓰기 불가 (Server Component 제약)
   
4. API Route (requireAuth)
   → Bearer 토큰 또는 쿠키 읽음
   → 검증 후 Supabase 클라이언트 반환
```

### JWT 갱신

Supabase는 자동으로 만료된 JWT를 새로운 토큰으로 갱신합니다:

```
1. 만료된 토큰 감지
   → Supabase 클라이언트가 401 수신
   
2. refresh_token 사용
   → 새로운 access_token 요청
   
3. 새 토큰을 쿠키에 저장
   → middleware에서 Set-Cookie 헤더 설정
   → 클라이언트는 자동 갱신
```

---

**참고:** `../AGENTS.md`에서 auth.ts, classify.ts 등 다른 lib 파일 문서 확인
