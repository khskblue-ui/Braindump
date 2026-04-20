<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# classify-patterns

## Purpose
사용자가 AI 분류 결과를 수정한 이력을 조회하고 삭제하는 페이지. 각 교정 기록은 원본 카테고리/태그와 수정된 값을 비교해서 보여준다.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 교정 이력 목록 페이지. Pattern 카드(원본 → 수정값), 개별/전체 삭제 |

## For AI Agents

### Working In This Directory
- **'use client'**: fetch API로 교정 이력 조회/삭제
- **pattern 상세**: keyword_context 일부 표시, 원본/수정된 카테고리, 원본/수정된 태그
- **삭제 모드**: 선택적 삭제 또는 전체 초기화 (confirm 팝업)

### Testing Requirements
- http://localhost:3000/settings/classify-patterns 접근 확인
- 교정 이력 목록 로드 확인
- 개별 pattern 삭제 작동 확인
- 전체 초기화 버튼 및 confirm 팝업 작동 확인
- 삭제 후 목록 갱신 확인

### Common Patterns
- `Pattern` 인터페이스: original_categories, corrected_categories, original_tags, corrected_tags, keyword_context
- categoryLabel() 함수로 카테고리 코드 → 한글 레이블 변환
- 전체 초기화는 id=all로 DELETE 요청

## Dependencies

### Internal
- None specific

### External
- **lucide-react** - 아이콘 (ArrowLeft, Trash2, RotateCcw)
- **sonner** - toast 알림

<!-- MANUAL: -->
