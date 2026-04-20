<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Supabase project configuration and Edge Functions -->

# supabase

## Purpose
Supabase 프로젝트 구성. Edge Functions (classify, delete-account), Postgres 스키마, 마이그레이션, RLS 정책 관리. iOS와 웹 양쪽이 공유하는 데이터베이스 및 인증.

## Key Files
| File | Description |
|------|-------------|
| `config.toml` | Supabase 프로젝트 설정 (DB 포트, 인증 설정 등) |
| `schema.sql` | 초기 스키마 정의 (entries, user_settings 테이블) |

## Subdirectories
- `functions/` → Edge Functions (Deno 런타임) — `/functions/AGENTS.md` 참고
- `migrations/` → Postgres 마이그레이션 (DDL, RLS 정책) — `/migrations/AGENTS.md` 참고
- `.temp/` → Supabase CLI 임시 파일 (무시)

## For AI Agents

### Working In This Directory
**Deno Edge Function 환경:**
- 런타임: Deno (TypeScript 지원)
- SDK: `@supabase/supabase-js@2`, `@anthropic-ai/sdk`
- 배포: `supabase functions deploy {name} --no-verify-jwt`

**배포 주의사항 (반드시 지킬 것):**
- `--no-verify-jwt` 플래그 **필수**
- 이유: 함수 내부에서 자체 인증 처리 (JWT 검증 중복 시 iOS SDK 토큰 거부)
- 과거 여러 번 발생한 배포 오류

### Testing Requirements
- 함수 변경 후: `supabase functions deploy {name} --no-verify-jwt` 로 배포 확인
- iOS SDK + 웹 클라이언트 양쪽에서 테스트 필수 (공유 함수)
- 환경 변수 설정: Supabase 대시보드 → Edge Functions → Secrets

### Common Patterns
- 서비스 role 클라이언트는 RLS 우회 (내부 전용)
- 사용자 인증은 JWT Bearer 토큰 검증 (함수 내부에서)
- 한국 시간(KST, UTC+9) 기준으로 모든 날짜 처리

## Dependencies
- **Supabase JS 2.101** — Auth, Database, Storage 클라이언트
- **@anthropic-ai/sdk 0.39.0** — Claude API (classify 함수만)
- **Deno** — 런타임 환경 (서버 내장)
