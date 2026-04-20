<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# settings

## Purpose
사용자 계정 및 앱 설정을 관리하는 페이지 그룹. 계정 정보, AI 분류 커스터마이징, 휴지통 자동 삭제 설정 포함.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 설정 메인 페이지. 계정 정보, AI 분류, 휴지통 설정, 도움말, 개인정보 처리방침 |
| `classify-guide/page.tsx` | 리다이렉트 페이지 (/guide#classify로 이동) |
| `classify-patterns/page.tsx` | AI 교정 이력 조회/삭제 페이지 |
| `classify-rules/page.tsx` | 사용자 정의 분류 규칙 추가/관리 페이지 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `classify-guide/` | 분류 가이드 리다이렉트 페이지 |
| `classify-patterns/` | 교정 이력 관리 페이지 |
| `classify-rules/` | 커스텀 규칙 관리 페이지 |

## For AI Agents

### Working In This Directory
- **메인 page**: 'use client' (스토어 접근, 설정 저장)
- **classify-guide**: 간단한 리다이렉트 (no client)
- **classify-patterns**: 'use client' (pattern 목록, 삭제)
- **classify-rules**: 'use client' (rule CRUD)

### Testing Requirements
- http://localhost:3000/settings 접근 확인
- 계정 정보(이메일) 표시 확인
- 로그아웃 버튼 작동 확인
- 휴지통 자동 비우기 옵션 변경 및 저장 확인
- /settings/classify-guide → /guide#classify 리다이렉트 확인
- /settings/classify-patterns와 /settings/classify-rules 접근 확인

### Common Patterns
- 메인 page에서 auto_purge_days (7/14/30/0일) 관리
- 교정 이력은 읽기 전용 (사용자가 수동 삭제만 가능)
- 커스텀 규칙은 keyword + category + context(task/schedule만) 조합
- 규칙 추가 시 Enter 또는 버튼으로 제출

## Dependencies

### Internal
- `@/stores/auth-store` - signOut() 메서드
- `@/components/ui/*` - Card, Button, Badge 등

### External
- **lucide-react** - 아이콘
- **sonner** - toast 알림

<!-- MANUAL: -->
