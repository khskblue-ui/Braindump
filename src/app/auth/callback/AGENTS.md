<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->

# auth/callback

## Purpose
OAuth 공급자(Apple, Google 등)가 인증 완료 후 리디렉트하는 콜백 엔드포인트. 공급자가 반환한 `code`를 Supabase 세션으로 교환하고 사용자를 원래 요청한 페이지로 돌려보낸다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET** 핸들러. `code` 쿼리 → `supabase.auth.exchangeCodeForSession(code)` → 세션 쿠키 설정 → `next` 쿼리로 리디렉트 (기본 `/home`). OAuth 공급자가 `error`/`error_description`을 반환하면 `/login?error=...`으로 보내며 로깅. open-redirect 방지를 위해 `next`는 반드시 `/`로 시작하고 `//`는 불허 — 그 외에는 `/home`으로 강제 리디렉트. |

## For AI Agents

### Working In This Directory
- **서버 전용** route. `@/lib/supabase/server`의 `createClient()` 사용 (쿠키 접근 필요).
- Supabase의 `exchangeCodeForSession`은 **한 번만 성공**한다. 동일 `code`로 재요청 시 실패 → 반드시 일회성 리디렉트로 소비.
- 성공 시 응답은 `NextResponse.redirect(...)`. 로그인 상태는 Supabase SSR 쿠키로 관리되므로 이후 요청은 middleware가 처리.

### Testing Requirements
- 로컬에서 Apple/Google 로그인을 시도하려면 Supabase Dashboard의 Auth → URL Configuration에 `http://localhost:3000/auth/callback`와 프로덕션 URL 양쪽이 허용 리디렉트 URL로 등록되어 있어야 한다.
- `error_description` 처리 경로는 Apple 로그인에서 발생하는 `user_cancelled_authorize` 등을 포함.

### Common Patterns
- `origin`은 `NextResponse.redirect`의 절대 URL을 위해 `new URL(request.url).origin`에서 도출.
- open-redirect 방어 (`next.startsWith('/') && !next.startsWith('//')`)는 AUTO 패턴. 새로운 쿼리 파라미터 추가 시 동일한 방어를 유지.

## Dependencies

### Internal
- `@/lib/supabase/server` — 서버용 Supabase 클라이언트 (쿠키 기반 세션)

### External
- `next/server` — `NextResponse.redirect`

## 관련
- 로그인 UI: `src/app/login/` — 여기에서 OAuth 버튼이 `provider.signInWithOAuth({ redirectTo: .../auth/callback })` 호출
- iOS OAuth (Apple/Google 네이티브 Sign-In SDK) 흐름과는 별개. iOS는 `AuthStore.signInWithApple`/`signInWithGoogle`에서 idToken 교환 방식 사용

<!-- MANUAL: -->
