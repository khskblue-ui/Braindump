<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Edge Functions (Deno runtime) -->

# functions

## Purpose
Supabase Edge Functions (서버리스). iOS와 웹 양쪽이 호출하는 분류 로직 및 계정 삭제 기능.

## Key Files
- `classify/index.ts` → AI 기반 항목 분류 (iOS/웹 공유)
- `delete-account/index.ts` → 계정 삭제 (사용자 전체 데이터 제거)

## Subdirectories
- `classify/` → `/functions/classify/AGENTS.md` 참고
- `delete-account/` → `/functions/delete-account/AGENTS.md` 참고

## For AI Agents

### Working In This Directory
**Deno Runtime:**
- TypeScript 지원, import는 ESM (URL import 사용)
- 배포: `supabase functions deploy {name} --no-verify-jwt`
- 환경 변수: Supabase 대시보드에서 별도 관리

### Testing Requirements
- 함수 배포 후 iOS + 웹 양쪽 클라이언트 테스트 필수
- 인증 검증: JWT Bearer 토큰 확인
- 권한 검증: entry 또는 user 소유권 확인

### Common Patterns
- Service role client로 RLS 우회 (내부 전용)
- JSON 응답: `{ status, headers: { "Content-Type": "application/json" } }`
- 에러 메시지는 한국어

## Dependencies
- **@supabase/supabase-js@2** — Supabase 클라이언트
- **@anthropic-ai/sdk** — Claude API (classify만)
