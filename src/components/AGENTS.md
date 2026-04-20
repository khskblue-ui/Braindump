<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Root components directory -->

# components

## Purpose
BrainDump 웹 앱의 모든 React 컴포넌트를 담는 루트 디렉토리. UI 레이어 전체를 구성하며, 각 기능별 서브디렉토리로 구분.

## Key Files
| File | Description |
|------|-------------|
| `OfflineSync.tsx` | 오프라인 상태 감지 및 토스트 알림. `online`/`offline` 이벤트 리스너 |
| `ServiceWorkerRegistration.tsx` | 프로덕션 환경에서만 서비스 워커 등록 (`/sw.js`) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `auth/` | 로그인/회원가입 폼, AuthProvider |
| `capture/` | QuickCapture 텍스트/음성/이미지/PDF 입력 영역 |
| `cards/` | EntryCard 목록 렌더링, 스켈레톤 로더 |
| `dashboard/` | TodayDashboard, CategoryTabs, Navigation, SearchBar, ReminderCheck 등 |
| `entry/` | EntryViewerModal, EntryEditModal — 상세보기/수정 |
| `guide/` | 랜딩 /guide 페이지 애니메이션 시스템 (8개 섹션) |
| `knowledge/` | (빈 디렉토리) — iOS와 호환성 유지용 |
| `landing/` | 랜딩 페이지 컴포넌트 (AppPreview, FAQ, FeatureHighlight 등) |
| `onboarding/` | 첫 방문 온보딩 모달 |
| `ui/` | shadcn primitives (Button, Dialog, Input, Textarea, Badge, Skeleton 등) |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어: 대부분의 서브디렉토리는 클라이언트 컴포넌트
- Zustand 스토어(`@/stores/*`)는 클라이언트에서만 접근 가능
- Path alias: `@/components/` → `src/components/`
- 이미지 최적화: `loading="lazy"`, `decoding="async"` 속성 권장

### Testing Requirements
- 컴포넌트 마운트 경로 검증 (어느 페이지에서 사용되는지)
- 상태 업데이트 후 렌더링 동작 확인
- 모바일 반응형 레이아웃 검증

### Common Patterns
- `cn()` (clsx) for conditional Tailwind styling
- `useEntryStore` for global state (entry list, filter, etc.)
- `toast.success/error/warning` for notifications (sonner)
- 형식 지정: `date-fns` + `ko` locale 사용
- 애니메이션: `framer-motion` (guide 섹션) 또는 Tailwind keyframes

## Dependencies

### Internal
- `@/stores/entry-store` — 엔트리 CRUD, 필터, 분류
- `@/stores/offline-store` — 오프라인 모드 상태
- `@/stores/auth-store` — 사용자 인증
- `@/types` — Entry, Category, CATEGORY_MAP 등
- `@/lib/browser-detect` — 브라우저 타입 감지 (in-app, iOS, desktop)
- `@/lib/calendar` — ICS 다운로드, Google Calendar URL

### External
- **shadcn/ui** + **Tailwind v4** — 디자인 시스템
- **lucide-react** — 아이콘
- **framer-motion** — 애니메이션 (guide 페이지)
- **date-fns** — 날짜 포맷팅
- **sonner** — 토스트 알림
- **pdfjs-dist** — PDF 렌더링 (viewer)

## Rendered Pages
- `src/app/(main)/home/page.tsx` — QuickCapture, CategoryTabs, TodayDashboard, EntryCard 목록
- `src/app/(main)/knowledge/page.tsx` — 지식 카테고리 표시
- `src/app/(auth)/page.tsx` — LoginForm
- `src/app/guide/page.tsx` — GuideTabs, GuideSection, 8개 mockup 섹션
- `src/app/page.tsx` — 랜딩 페이지 (AppPreview, FAQ, FeatureHighlight 등)
