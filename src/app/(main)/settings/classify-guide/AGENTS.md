<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# classify-guide

## Purpose
분류 가이드 페이지. `/guide#classify` 섹션으로 자동 리다이렉트하는 간단한 라우터 페이지.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 리다이렉트 페이지 (redirect() 호출) |

## For AI Agents

### Working In This Directory
- **간단한 리다이렉트**: server-side redirect('/guide#classify')
- **no client component**: 서버 사이드 컴포넌트

### Testing Requirements
- http://localhost:3000/settings/classify-guide 접근 시 /guide#classify로 리다이렉트 확인

## Dependencies

### External
- **Next.js redirect()** - 서버 사이드 리다이렉트

<!-- MANUAL: -->
