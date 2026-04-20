<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Account deletion (cascading user data cleanup) -->

# delete-account

## Purpose
계정 삭제 Edge Function. 인증된 사용자의 **전체 데이터를 영구 제거**: entries, user_settings, classify patterns/rules, auth.users 레코드.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | 계정 삭제 로직 (130줄) — 5단계 데이터 삭제 + 관리자 계정 삭제 |

## Schema
**요청 본문:**
```json
{
  "user_id": "uuid"
}
```

**인증:** JWT Bearer 토큰 (Authorization 헤더)
- 토큰의 사용자 ID가 요청의 `user_id`와 일치해야 함 (본인만 삭제 가능)

**응답 성공:**
```json
{
  "success": true
}
```

**응답 실패:**
```json
{
  "error": "사용자 데이터 삭제에 실패했습니다."
}
```

## Implementation Details

### 삭제 순서 (중요: CASCADE 정책 고려)
1. `entries` — 모든 항목 삭제
2. `user_settings` — 사용자 설정 삭제
3. `user_classify_patterns` — 분류 학습 패턴 삭제
4. `user_classify_rules` — 분류 규칙 삭제
5. `auth.users` — 인증 계정 삭제 (admin API)

### 주의사항
- **비가역적 작업**: 삭제 후 복구 불가
- **관리자 삭제**: `auth.admin.deleteUser()` 사용 (일반 SDK로 불가)
- **권한 검증**: JWT 토큰의 사용자와 요청 `user_id` 일치 확인
- **에러 처리**: 각 단계 실패 시 명확한 에러 메시지 (한국어)

## For AI Agents

### Working In This Directory
```bash
supabase functions deploy delete-account --no-verify-jwt
```

### Testing Requirements
- 환경 변수: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- 테스트 사용자로 먼저 실행 후, DB 전체 데이터 삭제 확인
- 테스트 후 auth.users도 완전 삭제되는지 확인
- **주의**: 프로덕션 환경에서는 신중히 테스트

### Common Patterns
- POST만 지원 (GET/DELETE 불가)
- 에러 코드: 400 (요청 오류), 401 (인증 필요), 403 (권한 없음), 500 (서버 오류)
- 중간 단계 실패 시 부분 삭제 상태 발생 가능 → 트랜잭션 방식 개선 고려

## Dependencies
- **@supabase/supabase-js@2** — DB 접근 + 관리자 API
