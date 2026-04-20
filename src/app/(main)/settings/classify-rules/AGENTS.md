<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# classify-rules

## Purpose
사용자 정의 분류 규칙을 추가하고 관리하는 페이지. 특정 키워드가 포함되면 자동으로 지정한 카테고리로 분류되도록 커스텀 규칙을 설정한다.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 규칙 관리 페이지. 규칙 추가 폼 + 규칙 목록 (CRUD) |

## For AI Agents

### Working In This Directory
- **'use client'**: fetch API로 규칙 CRUD (create, read, delete)
- **규칙 구조**: keyword, category, context(task/schedule만)
- **context picker**: task 또는 schedule 카테고리 선택 시에만 노출

### Testing Requirements
- http://localhost:3000/settings/classify-rules 접근 확인
- 키워드 입력 후 카테고리 선택 확인
- task/schedule 선택 시 context picker 노출 확인
- 규칙 추가 버튼 또는 Enter로 제출 확인
- 규칙 목록에 추가된 항목 표시 확인
- 개별 규칙 삭제 작동 확인
- 규칙 개수 제한(최대 50개) 안내 확인

### Common Patterns
- `showContextPicker = category === 'task' || category === 'schedule'`로 조건부 렌더링
- 규칙 추가 시 keyword trim, context는 showContextPicker && context 선택 시에만 전송
- 규칙 목록은 생성 순(최신순) 정렬 (prepend)

## Dependencies

### Internal
- None specific

### External
- **lucide-react** - 아이콘 (ArrowLeft, Plus, Trash2)
- **sonner** - toast 알림

<!-- MANUAL: -->
