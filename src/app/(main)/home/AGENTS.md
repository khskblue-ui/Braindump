<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# home

## Purpose
로그인 후 메인 대시보드 페이지. 사용자의 모든 항목(entry)을 조회, 필터링, 검색, 분류하고, 빠른 입력창(QuickCapture)과 오늘의 대시보드(TodayDashboard)를 제공한다.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 메인 대시보드 페이지. QuickCapture, TodayDashboard, CategoryTabs, SearchBar, EntryCard 목록 |
| `loading.tsx` | 초기 로딩 중 skeleton UI 표시 |

## For AI Agents

### Working In This Directory
- **'use client'**: 전역 상태 관리(Zustand), 동적 필터링, 모달 필요
- **스토어 접근**: `useEntryStore()` - entries, filter, sortMode, moveEntry 등
- **동적 로드**: EntryEditModal, EntryViewerModal은 dynamic() 사용 (성능)
- **IntersectionObserver**: 무한 스크롤 구현 (loadMore)

### Testing Requirements
- http://localhost:3000/home 접근 가능 (로그인 필수)
- QuickCapture 입력창 표시 및 입력 가능 확인
- CategoryTabs 클릭 시 필터링 작동 확인
- SearchBar 검색 작동 확인
- EntryCard 클릭 시 모달 열림/닫힘 확인
- 스크롤 끝 시 loadMore 작동 확인

### Common Patterns
- Entry는 서버에서 fetchEntries()로 로드하고, 클라이언트 상태에서 관리
- modalMode는 'view' (장문/PDF) 또는 'edit' (짧은 텍스트)
- sortMode로 drag-drop 정렬 모드 지원
- 미분류 inbox의 개별 항목 재분류 가능

## Dependencies

### Internal
- `@/stores/entry-store` - entry 데이터 관리 (fetch, create, update, delete)
- `@/components/capture/QuickCapture` - 빠른 입력
- `@/components/dashboard/*` - CategoryTabs, SearchBar, TodayDashboard, ReminderCheck, VisitReview
- `@/components/cards/EntryCard` - 항목 카드
- `@/components/entry/*` - EntryEditModal, EntryViewerModal (동적 로드)
- `@/components/onboarding/OnboardingModal` - 첫 방문 온보딩

### External
- **Zustand 5** - 전역 상태
- **sonner** - toast 알림
- **lucide-react** - 아이콘
- **next/dynamic** - 동적 import

<!-- MANUAL: -->
