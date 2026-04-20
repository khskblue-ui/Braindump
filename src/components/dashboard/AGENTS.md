<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Home dashboard — tabs, search, navigation, reminders -->

# dashboard

## Purpose
홈 대시보드의 모든 UI. 상단 헤더/컨텍스트 필터, 카테고리 탭, 검색창, 오늘의 대시보드, PWA 설치 프롬프트, 방문 리뷰, 리마인더 체크.

## Key Files
| File | Description |
|------|-------------|
| `Navigation.tsx` | TopHeader, BottomNavigation. TopHeader는 로고 + 컨텍스트 필터(전체/work/personal). BottomNavigation은 4개 탭(홈/지식/휴지통/설정) |
| `CategoryTabs.tsx` | 수평 스크롤 탭. 전체 + 6개 카테고리. 선택 시 필터 업데이트 |
| `SearchBar.tsx` | 검색 입력 (300ms 디바운스), 클리어 버튼. 검색어 필터 업데이트 |
| `TodayDashboard.tsx` | 오늘 일정, 지연된 일정, 높은 우선순위 할 일 표시. 축약/확장 토글 |
| `ReminderCheck.tsx` | 리마인더 시간 도달 시 토스트/Notification 표시 (1분마다 체크) |
| `PwaInstallPrompt.tsx` | PWA/앱 설치 배너. 7일 dismiss 쿠키, 브라우저 타입별 메시지 |
| `VisitReview.tsx` | 방문당 한 번 표시. 완료한 할 일, 새 아이디어, 다가오는 일정 요약 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어
- **컨텍스트 필터**: useEntryStore의 filter.context 상태, TopHeader에서 순환
- **카테고리 필터**: filter.category로 업데이트 (undefined = 전체)
- **검색 필터**: filter.query로 업데이트 (디바운스 적용)
- **TodayDashboard**: due_date 기반 오늘/지연/높은우선순위 분류. expanded 상태로 축약/확장
- **ReminderCheck**: 1분마다 체크, `Notification.permission === 'granted'` 확인
- **PwaInstallPrompt**: 7일 dismiss 쿠키 확인, 3초 후 표시
- **VisitReview**: 24시간 미만 방문 시 표시 안 함, 첫 방문(lastSeen=null) 감지

### Testing Requirements
- 컨텍스트 버튼 클릭 시 필터 업데이트 (전체 → work → personal → 전체)
- 카테고리 탭 클릭 시 필터 적용
- 검색 입력 (300ms 후 필터 적용)
- TodayDashboard 축약/확장 토글
- 리마인더 도달 시 토스트 표시
- PWA 설치 배너 7일 dismiss 확인

### Common Patterns
- `useEntryStore((s) => s.filter)` — 필터 상태
- `useMemo()` — 비용이 큰 필터링(TodayDashboard, VisitReview)
- `formatDistanceToNow()` — 상대 시간 표시
- `localStorage` — dismiss 쿠키, lastSeen 추적

## Dependencies

### Internal
- `@/stores/entry-store` — entries, filter, setFilter
- `@/types` — Entry, CATEGORIES, CATEGORY_MAP, hasCategory, REMINDER_OPTIONS
- `@/lib/browser-detect` — detectBrowserContext, isStandalone
- `@/components/ui/button` — shadcn 프리미티브
- `@/components/landing/InstallGuideModal` — PWA 설치 안내

### External
- **lucide-react** — ChevronDown, ChevronUp, Search, X, Zap, Smartphone 등
- **date-fns** — format, isToday, isPast, startOfDay, formatDistanceToNow
- **date-fns/locale** — ko
- **sonner** — toast.success, toast.warning, toast.error, toast.info

## Rendered Pages
- `src/app/(main)/home/page.tsx` — TodayDashboard, CategoryTabs, SearchBar, ReminderCheck, VisitReview, PwaInstallPrompt
- `src/app/(main)/layout.tsx` — Navigation (TopHeader, BottomNavigation)
