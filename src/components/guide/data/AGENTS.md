<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Classification system documentation data -->

# data

## Purpose
분류 시스템 설명 데이터. 6개 카테고리, 분류 결정 트리, 다중 카테고리 예시, 긴 문서 규칙.

## Key Files
| File | Description |
|------|-------------|
| `classify-data.ts` | CATEGORY_INFO (6개 카테고리 설명, 아이콘, 예시), FLOW_STEPS (5단계 결정 트리), MULTI_CATEGORY_EXAMPLES (다중 카테고리 예시), LONG_DOC_RULES (긴 문서 분류 규칙) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| (없음) | — |

## For AI Agents

### Working In This Directory
- TypeScript 데이터 파일 (no 'use client')
- CATEGORY_INFO: task, idea, memo, knowledge, schedule, inbox — 각 아이콘, label, value, color, type, desc, examples
- FLOW_STEPS: 5단계 분류 알고리즘 (시간정보 → 완결성 → 열려있음 → 참고용 → 미분류)
- MULTI_CATEGORY_EXAMPLES: 입력 → 카테고리 조합
- LONG_DOC_RULES: condition → result 매핑

### Testing Requirements
- CATEGORY_INFO의 색상 코드가 실제 CATEGORY_MAP과 일치 확인
- FLOW_STEPS의 결정 트리 로직이 AI 분류 엔진과 동기화 확인

### Common Patterns
- 아이콘은 lucide-react에서 import (CheckSquare, Lightbulb, StickyNote 등)
- 색상은 16진수 코드 (#3B82F6 등)

## Dependencies

### Internal
- (없음)

### External
- **lucide-react** — CheckSquare, Lightbulb, StickyNote, BookOpen, CalendarDays, Inbox 아이콘

## Usage
- `/guide` 페이지에서 GuideTabs 섹션 설명 표시
