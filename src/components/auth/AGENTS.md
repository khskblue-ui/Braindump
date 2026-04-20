<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Auth flows and login UI -->

# auth

## Purpose
사용자 인증 UI 및 세션 관리. 이메일/비밀번호, Google/Apple OAuth, 인앱 브라우저 감지.

## Key Files
| File | Description |
|------|-------------|
| `AuthProvider.tsx` | 앱 루트 레이아웃에서 세션 초기화. `useAuthStore().initialize()` 호출 후 cleanup |
| `LoginForm.tsx` | 이메일/비밀번호 & OAuth (Google/Apple) 로그인 폼. 인앱 브라우저 감지 시 외부 브라우저 안내 표시 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어 사용
- `detectBrowserContext()` — 인앱 브라우저 판정 (iOS non-Safari, in-app webviews)
- OAuth 콜백: URL query `?error=...` 파라미터로 에러 처리
- `isSignUp` 상태로 로그인/회원가입 토글

### Testing Requirements
- 이메일 입력 후 회원가입 (6자 이상 비밀번호)
- Google/Apple OAuth 버튼 클릭 (실제 리다이렉트)
- 인앱 브라우저(iOS non-Safari) 감지 시 "외부 브라우저에서 열어주세요" UI 표시

### Common Patterns
- `useAuthStore()` — signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple
- 에러는 `toast.error()` 또는 상태 메시지로 표시
- 버튼 disabled 상태: `loading` 중일 때
- 개인정보 처리방침 링크: `/privacy`

## Dependencies

### Internal
- `@/stores/auth-store` — 로그인/회원가입 메서드
- `@/lib/browser-detect` — BrowserContext 타입, detectBrowserContext()
- `@/components/landing/InstallGuideModal` — 인앱 브라우저용 설치 안내 모달
- `@/components/ui/Logo` — BrainDump 로고
- `@/components/ui/button`, `input`, `separator` — shadcn 프리미티브

### External
- **lucide-react** — ExternalLink 아이콘
- **sonner** — toast 알림

## Rendered Pages
- `src/app/(auth)/page.tsx` — 로그인 페이지 (로그아웃 상태)
