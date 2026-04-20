<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->

# app/ (Root Layout)

## Purpose
Next.js 앱 라우팅의 최상위 진입점. 모든 페이지를 감싼 root layout으로, 전역 설정(폰트, 메타데이터, auth provider, service worker)을 관리한다.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | Root 레이아웃. AuthProvider, OfflineSync, ServiceWorkerRegistration, Toaster 포함 |
| `globals.css` | 전역 스타일 (Tailwind) |
| (하위 경로) | `(landing)`, `(main)`, `auth/`, `login/`, `share/`, `privacy/` 등의 route groups |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `(landing)/` | 로그인 불필요한 공개 페이지 (랜딩, 가이드) |
| `(main)/` | 로그인 필요 (home, knowledge, settings, trash) |
| `auth/` | OAuth 리디렉션 처리 |
| `login/` | 로그인 페이지 |
| `share/` | iOS Share Extension에서 온 웹 리디렉션 |
| `privacy/` | 개인정보 처리방침 |

## For AI Agents

### Working In This Directory
- Next.js 16 + React 19 구조 (route groups는 URL에 포함되지 않음)
- `use client` directive를 통해 특정 부분만 클라이언트 컴포넌트로 지정
- Zustand 스토어는 클라이언트에서만 접근 가능

### Testing Requirements
- 로컬에서 `npm run dev` 시작, http://localhost:3000 확인
- 전역 레이아웃 변경 시 모든 페이지 영향 → 주의깊게 검토

### Common Patterns
- AuthProvider로 모든 페이지를 감싸서 인증 상태 관리
- ServiceWorkerRegistration으로 PWA 지원
- OfflineSync로 오프라인 모드 지원
- Toaster는 전역 toast 알림 표시

## Dependencies

### Internal
- `@/components/auth/AuthProvider` - 전역 인증 상태 관리
- `@/components/OfflineSync` - 오프라인 동기화
- `@/components/ServiceWorkerRegistration` - Service Worker 등록
- `@/components/ui/sonner` - Toast 알림

### External
- **Next.js 16.2.2** - 프레임워크
- **Geist 폰트** - Google Fonts

<!-- MANUAL: -->
