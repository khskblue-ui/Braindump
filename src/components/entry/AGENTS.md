<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Entry detail modals — viewer and editor -->

# entry

## Purpose
엔트리 상세 모달. ViewerModal은 읽기 전용 (복사, 재분류, 삭제), EditModal은 전체 속성 수정 (텍스트, 카테고리, 태그, 우선순위, 일정, 리마인더, 컨텍스트, 핀).

## Key Files
| File | Description |
|------|-------------|
| `EntryViewerModal.tsx` | 읽기 전용 모달. 전체 화면 확장, 텍스트 복사, AI 재분류, 삭제, 일정 export (ICS/Google Calendar) |
| `EntryEditModal.tsx` | 수정 모달. 텍스트, 요약, 카테고리 multi-select, 태그, 토픽, 우선순위, due_date, 리마인더 multi-select, 컨텍스트, 핀 고정. 복원 옵션(deleted_at=null) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- `'use client'` 지시어
- **ViewerModal**: fullscreen 레이아웃, 뒤로 버튼, 수정/재분류/삭제 액션 아이콘
  - 텍스트 복사: `navigator.clipboard.writeText()`
  - 재분류: `/api/classify` POST, result로 state 업데이트
  - 삭제: soft delete (`deleteEntry()`)
  - PDF 페이지: `extracted_text` split by `\n{2,}`
  - 일정 export: `downloadICS()` 또는 Google Calendar URL
- **EditModal**: 모든 필드 수정 가능
  - due_date: `<input type="datetime-local">` 활용
  - 태그: 쉼표 구분 입력, 후처리로 trim/filter
  - 리마인더: REMINDER_OPTIONS 배열로 multi-select
  - 저장: `updateEntry()` 호출
  - 로컬 삭제(soft delete): `softDelete()`
  - 휴지통 복원: `restoreEntry()`

### Testing Requirements
- ViewerModal: 텍스트 복사, 재분류 API 호출, 삭제 확인 대화
- EditModal: 각 필드 수정 후 저장, due_date datetime-local 포맷 확인
- 리마인더 multi-select (최대 3개 권장)
- 일정 export (ICS 파일 다운로드 또는 Google Calendar URL)

### Common Patterns
- `entry.summary || entry.raw_text || '(이미지)'` — 표시할 텍스트 우선순위
- `hasCategory(entry, 'task')` — task 카테고리 확인 시에만 체크박스 표시
- `formatDistanceToNow()` — 생성 시간 표시
- due_date 포맷: `d.getFullYear()-pad(d.getMonth()+1)-pad(d.getDate())T...`

## Dependencies

### Internal
- `@/stores/entry-store` — updateEntry, deleteEntry, softDelete, restoreEntry, fetchEntries
- `@/types` — Entry, EntryCategory, EntryContext, EntryPriority, ReminderOption, CATEGORIES, REMINDER_OPTIONS, hasCategory
- `@/lib/calendar` — downloadICS, getGoogleCalendarUrl
- `@/components/ui/dialog`, `button`, `input`, `textarea`, `badge` — shadcn 프리미티브

### External
- **lucide-react** — Pencil, Trash2, Sparkles, ArrowLeft, FileText, Copy, Check, Pin, PinOff, User, Building2 아이콘
- **date-fns** — formatDistanceToNow, format
- **date-fns/locale** — ko
- **sonner** — toast.success, toast.error, toast.warning

## Rendered Pages
- `src/app/(main)/home/page.tsx` — EntryCard 클릭 시 EntryViewerModal 열림
- EntryViewerModal에서 "수정" 클릭 시 EntryEditModal 열림
