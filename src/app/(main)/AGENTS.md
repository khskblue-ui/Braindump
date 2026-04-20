<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# (main)

## Purpose
로그인이 필요한 메인 앱 라우트 그룹. 사용자의 콘텐츠 관리(홈, 지식, 설정, 휴지통)를 위한 페이지들을 제공한다.

## Key Files
| File | Description |
|------|-------------|
| `layout.tsx` | 메인 레이아웃. TopHeader, BottomNavigation, 배경 그래디언트, 콘테이너 관리 |
| (하위 페이지들) | home, knowledge, settings, trash 등 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `home/` | 메인 대시보드 (entry list, quick capture, 분류, 필터) |
| `knowledge/` | 지식 항목 목록 및 토픽 상세 |
| `settings/` | 계정, AI 분류, 휴지통 설정 |
| `trash/` | 삭제된 항목 복원/영구 삭제 |

## For AI Agents

### Working In This Directory
- **인증 필수**: middleware.ts에서 auth 세션 확인 (로그인 안 했으면 /login으로 리디렉트)
- **layout.tsx**: TopHeader(상단), BottomNavigation(하단), 배경 그래디언트, 콘테이너 max-w-3xl
- **스토어 접근**: useEntryStore() 등 Zustand 스토어 (클라이언트 전용)

### Testing Requirements
- 로그인 후 http://localhost:3000/home 접근 가능 (로그인 없으면 /login으로 리디렉트)
- TopHeader와 BottomNavigation 내비게이션 작동 확인
- 네비게이션 간 전환 시 레이아웃 유지 확인

### Common Patterns
- 모든 페이지는 'use client' (스토어, 동적 상태 필요)
- 스토어에서 entries, filter, sortMode 등 글로벌 상태 관리
- entry 클릭 시 EntryEditModal 또는 EntryViewerModal 동적 로드

## Dependencies

### Internal
- `@/components/dashboard/Navigation` - TopHeader, BottomNavigation
- `@/stores/entry-store` - 전역 entry 상태

### External
- **Next.js 16** - layout, route groups

<!-- MANUAL: -->
