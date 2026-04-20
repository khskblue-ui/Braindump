<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# privacy

## Purpose
개인정보 처리방침 페이지. BrainDump의 데이터 수집, 처리, 보관, 제3자 제공 등 개인정보 정책을 안내한다.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 개인정보 처리방침 페이지 (정적 콘텐츠, Metadata 포함) |

## For AI Agents

### Working In This Directory
- **정적 페이지**: 서버 사이드 렌더링 (메타데이터 설정)
- **구조**: 8개 섹션 (처리 목적, 수집 항목, 보유/파기, 제3자 제공, 안전성, 이용자 권리, 보호책임자, 변경 안내)

### Testing Requirements
- http://localhost:3000/privacy 접근 확인
- 페이지 제목이 "개인정보 처리방침 - BrainDump"로 표시 확인
- 모든 섹션 내용 표시 확인
- 메일 링크(lifescienkhs@naver.com) 작동 확인

### Common Patterns
- 정적 HTML 구조 (ul, li, strong, a 등)
- 색상: text-gray-700 dark:text-gray-300 (다크모드 지원)
- 링크: target="_blank", rel="noopener noreferrer"

## Dependencies

### External
- **Next.js Metadata** - 페이지 제목/설명

<!-- MANUAL: -->
