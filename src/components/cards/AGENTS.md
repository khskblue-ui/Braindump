<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Entry list cards and loading skeleton -->

# cards

## Purpose
엔트리 목록 렌더링. 개별 카드는 카테고리 배지, 생성 시간, 태그, 썸네일, 완료 체크박스 표시. 스켈레톤 로더는 데이터 로딩 중 표시.

## Key Files
| File | Description |
|------|-------------|
| `EntryCard.tsx` | 엔트리 카드. 카테고리, 컨텍스트(work/personal), 태그, 완료 상태, 핀 고정, 우선순위 표시. 정렬 모드에서 위/아래 버튼 표시. React.memo로 최적화 |
| `EntryCardSkeleton.tsx` | 로딩 스켈레톤. Skeleton 컴포넌트로 자리 표시 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어 (EntryCard)
- **React.memo** — 불필요한 리렌더 방지 (props 변경 없으면 스킵)
- **카테고리 표시**: `entry.categories` 배열, CATEGORY_MAP 사용 (색상 코드)
- **컨텍스트 버튼**: work/personal/null 세 상태 순환
- **완료 체크박스**: `toggleComplete()` 호출, 할 일만 표시
- **핀 고정**: `updateEntry()` 호출, 다른 모달 열기 전 e.stopPropagation()
- **정렬 모드**: `sortMode` prop이 true일 때 up/down 버튼 표시, first/last 속성으로 disabled 처리

### Testing Requirements
- 엔트리 클릭 시 모달 열기
- 완료 체크박스 클릭 (할 일 카테고리만)
- 핀 고정 토글
- 컨텍스트 버튼 순환 (null → work → personal → null)
- 정렬 모드에서 up/down 버튼 작동 및 disabled 상태

### Common Patterns
- `formatDistanceToNow(new Date(entry.created_at), { locale: ko })`
- `hasCategory(entry, 'task')` — 카테고리 확인
- `primaryCategory()` — 첫 카테고리 추출
- 이미지 thumbnailUrl은 `loading="lazy"`, `decoding="async"`

## Dependencies

### Internal
- `@/types` — Entry, CATEGORY_MAP, hasCategory, primaryCategory
- `@/stores/entry-store` — toggleComplete, updateEntry
- `@/components/ui/card`, `badge` — shadcn 프리미티브

### External
- **lucide-react** — Check, Square, Clock, FileText, Pin, ChevronUp, ChevronDown 아이콘
- **date-fns** — formatDistanceToNow, format
- **date-fns/locale** — ko (한국어)

## Rendered Pages
- `src/app/(main)/home/page.tsx` — 필터된 엔트리 목록 (EntryCard 배열)
