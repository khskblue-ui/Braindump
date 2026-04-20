<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# trash

## Purpose
삭제된 항목들을 보관하는 휴지통 페이지. 사용자가 항목을 복원하거나 영구 삭제할 수 있으며, 휴지통을 비워서 모든 삭제된 항목을 일괄 제거할 수 있다.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 휴지통 페이지. 삭제된 항목 목록, 복원/영구 삭제/휴지통 비우기 기능 |

## For AI Agents

### Working In This Directory
- **'use client'**: 스토어 접근 (trashEntries, fetchTrash, restoreEntry, permanentDelete, emptyTrash)
- **이중 확인 UI**: 버튼 한 번 클릭 시 "정말 [작업]하겠습니까?" 텍스트 변경, 3초 후 자동 초기화

### Testing Requirements
- http://localhost:3000/trash 접근 확인
- 삭제된 항목 목록 로드 확인
- 개별 항목 복원 버튼 작동 확인
- 개별 항목 영구 삭제 (이중 확인) 작동 확인
- 휴지통 비우기 (이중 확인) 작동 확인
- 삭제 후 목록 갱신 확인

### Common Patterns
- confirmState: 'empty' | entryId | null로 이중 확인 관리
- confirmTimerRef: 3초 자동 초기화 (clearTimeout)
- 복원 후 homepage로 entry 복귀

## Dependencies

### Internal
- `@/stores/entry-store` - trashEntries, fetch/restore/delete 메서드

### External
- **lucide-react** - 아이콘 (Trash2, RotateCcw)
- **sonner** - toast 알림
- **date-fns** - 삭제 시간 표시

<!-- MANUAL: -->
