<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# auth

## Purpose
OAuth 리디렉션 처리 디렉토리. Supabase Auth에서 로그인 완료 후 리다이렉트되는 callback을 처리한다.

## Key Files
| File | Description |
|------|-------------|
| `callback/` | OAuth callback 처리 서브디렉토리 |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `callback/` | Supabase Auth callback URL 처리 |

## For AI Agents

### Working In This Directory
- **auth/** 자체는 네비게이션 대상 아님 (callback/ 서브페이지만 사용)
- **callback 페이지**: 로그인 완료 후 세션 설정 및 /home 리다이렉트

### Testing Requirements
- Supabase OAuth 리디렉션 후 callback 처리 확인
- 세션 설정 후 /home으로 리다이렉트 확인

## Dependencies

### Internal
- `@/components/auth/*` - 인증 관련 컴포넌트

### External
- **Supabase Auth** - OAuth 세션 처리

<!-- MANUAL: -->
