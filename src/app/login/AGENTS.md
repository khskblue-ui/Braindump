<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# login

## Purpose
사용자 로그인 페이지. Google, Apple, GitHub 소셜 로그인(OAuth) 또는 이메일/비밀번호 로그인을 제공한다.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | 로그인 페이지. LoginForm 컴포넌트 표시 (중앙 정렬) |

## For AI Agents

### Working In This Directory
- **page.tsx**: 매우 간단한 레이아웃 페이지 (LoginForm 캡슐화)
- **LoginForm은 별도 컴포넌트**: @/components/auth/LoginForm에서 정의
- **비인증**: 로그인하지 않은 사용자만 접근 가능 (로그인 완료 시 /home으로 리다이렉트)

### Testing Requirements
- http://localhost:3000/login 접근 확인
- LoginForm 표시 확인
- 로그인 완료 후 /home으로 리다이렉트 확인

## Dependencies

### Internal
- `@/components/auth/LoginForm` - 로그인 폼 (OAuth, 이메일/비밀번호)

### External
- **Next.js** - 라우팅

<!-- MANUAL: -->
