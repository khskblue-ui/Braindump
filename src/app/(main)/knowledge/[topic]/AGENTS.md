<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->

# knowledge/[topic]

## Purpose
특정 지식 토픽에 속한 엔트리 목록을 보여주고, 토픽 이름을 수정할 수 있는 상세 페이지. `/knowledge`에서 토픽 카드를 클릭하면 이 페이지로 진입한다.

**URL 패턴**: `/knowledge/[topic]` (예: `/knowledge/swiftui`)
**Dynamic segment**: `topic` — Next.js `useParams()`로 읽어 `decodeURIComponent`로 복호화 (한글/공백 등 지원).

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | `'use client'` 페이지. 마운트 시 `GET /api/topics/{topic}` 호출로 엔트리 목록 fetch → `EntryCard` 리스트 렌더 → 엔트리 클릭 시 `EntryEditModal` 오픈. 상단 우측 연필 아이콘으로 인라인 이름 편집 (✓ / ✗ 버튼 또는 Enter/Esc 키). 변경 시 `PATCH /api/topics/{topic}` 호출 후 `router.replace(/knowledge/{newName})`로 이동. 실패 시 토스트 표시하고 기존 이름 복원. |

## For AI Agents

### Working In This Directory
- 이 페이지는 `'use client'` 컴포넌트. SSR 생략, 클라이언트에서 fetch.
- `useParams()` 훅을 반드시 `decodeURIComponent`로 풀어야 한다. URL에 `%ED%8C%8C` 같은 인코딩이 들어올 수 있음.
- **낙관적 UI 금지**: 토픽 이름 변경은 API 응답을 받은 후에만 라우터 이동. 실패 시 원 상태로 복원.
- 토픽 이름 비교는 `toLowerCase()` 기반 — DB 스토리지가 소문자 정규화됐음을 전제.
- 엔트리 수 표시 `(${entries.length}개)`는 fetch 완료 후만 정확. 로딩 중에는 `EntryCardSkeleton` 3개 표시.

### Testing Requirements
- 로컬: `/knowledge/{이미_존재하는_토픽}` 직접 진입 후 엔트리 목록 확인
- 이름 변경: Enter/✓/Esc/✗ 각 경로 검증
- URL에 한글 토픽명 들어간 경우 (`/knowledge/스위프트`) 정상 동작 확인
- 존재하지 않는 토픽: 빈 목록과 "항목이 없습니다" 메시지 표시

### Common Patterns
- 엔트리 선택 시 `EntryEditModal`을 모달로 띄우고 닫히면 `selectedEntry = null`. 이 패턴은 `src/app/(main)/home/page.tsx`와 동일.
- 인라인 편집 모드 토글 (`isEditing` state)은 `EntryEditModal`과는 별개의 로컬 UI 상태.

## Dependencies

### Internal
- `@/components/cards/EntryCard` — 엔트리 카드 (see `src/components/cards/AGENTS.md`)
- `@/components/cards/EntryCardSkeleton` — 로딩 플레이스홀더
- `@/components/entry/EntryEditModal` — 엔트리 편집 모달 (see `src/components/entry/AGENTS.md`)
- `@/components/ui/button`, `@/components/ui/input` — shadcn 프리미티브
- `@/types` — `Entry` 타입

### External
- `next/navigation` — `useParams`, `useRouter`
- `next/link` — 뒤로가기 링크
- `lucide-react` — 아이콘 (`ArrowLeft`, `Pencil`, `Check`, `X`, `BookOpen`)
- `sonner` — 토스트 알림

## 관련 API
- `GET /api/topics/{topic}` — 해당 토픽의 엔트리 목록 조회 (see `src/app/api/topics/[topic]/AGENTS.md`)
- `PATCH /api/topics/{topic}` — 토픽 이름 변경 (모든 소속 엔트리의 `topic` 컬럼을 일괄 업데이트)

<!-- MANUAL: -->
