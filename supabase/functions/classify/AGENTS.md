<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: AI-powered entry classification (shared iOS + web) -->

# classify

## Purpose
AI 기반 항목 분류 Edge Function. 사용자 입력(텍스트/이미지/PDF)을 받아 6개 카테고리(task/idea/memo/knowledge/schedule/inbox)로 자동 분류. **iOS와 웹 양쪽 모두에서 호출**.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | 분류 로직 (650줄) — 텍스트/이미지/PDF 처리, 사용자 패턴/규칙 적용, 결과 DB 저장 |

## Schema
**요청 본문:**
```json
{
  "entry_id": "uuid",
  "user_id": "uuid (optional, iOS SDK 대폴백용)"
}
```

**인증:** JWT Bearer 토큰 (Authorization 헤더)

**응답:**
```json
{
  "categories": ["task", "schedule"],
  "tags": ["마케팅", "분기보고"],
  "summary": "4월 30일 (수) 분기보고서 제출",
  "due_date": "2026-04-30T15:00:00+09:00",
  "context": "work",
  "topic": "reporting",
  "related_topics": ["business", "deadline"]
}
```

## Implementation Details

### 분류 판단 기준 (순서대로)
1. **시간 정보 있음** → `schedule`
2. **행동 완료 가능** → `task` (e.g., "보고서 제출")
3. **열린 생각/아이디어** → `idea` (e.g., "앱에 다크모드 넣으면 좋겠다")
4. **참고/학습 정보** → `memo` 또는 `knowledge`
5. **판단 불가** → `inbox`

### 핵심 기능
- **다중 카테고리 지원**: 하나의 항목이 여러 카테고리 가능 (최대 3개, 첫 번째가 주 카테고리)
- **날짜 해석**: 한국 시간(KST, UTC+9) 기준. 캘린더 참조표 자동 생성 (21일, 주 단위)
- **이미지 처리**: Supabase Storage URL → 다운로드 → Base64 인코딩 → Claude API로 OCR + 분류
- **PDF 처리**: 전체 텍스트를 요약/분류. 자동으로 `knowledge` 카테고리 추가
- **사용자 맞춤화**: 과거 수정 이력(`user_classify_patterns`) + 사용자 규칙(`user_classify_rules`)
- **날짜 drift 방지**: 기존 `due_date` 있으면 재분류 시 보존 (상대 표현 재계산 방지)

### 주의사항
- **`--no-verify-jwt` 필수**: 함수 내부에서 JWT 검증. 게이트웨이 검증 중복 시 iOS SDK 토큰 거부
- **iOS/웹 공유**: 양쪽에서 동시 호출 가능. 함수 변경 시 양쪽 영향
- **SSRF 방지**: 이미지 URL은 Supabase Storage 도메인만 허용
- **due_date drift 버그 방지**: 기존 `due_date` 있으면 재분류 시 보존 (가드: `if (result.due_date && !entry.due_date)`). 상대 표현("다음주 금요일")은 호출 시점마다 다시 계산되므로 기존 날짜가 있으면 유지

### 시스템 프롬프트
- 한국어, 한국 시간 기준
- 캘린더 참조표 자동 생성
- 사용자 패턴/규칙 자동 주입 (우선순위: 규칙 > 패턴 > 기본 로직)

## For AI Agents

### Working In This Directory
```bash
supabase functions deploy classify --no-verify-jwt
```

### Testing Requirements
- 환경 변수 확인: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`
- iOS 클라이언트 + 웹 클라이언트 양쪽에서 테스트
- 한국 시간 기준 날짜 검증 (현재 캘린더 참조표와 일치)

### Common Patterns
- 요청 파싱 → 소유권 검증 → 사용자 패턴/규칙 조회 → Claude 호출 → 결과 DB 저장
- 에러 코드: 400 (요청 오류), 401 (인증 필요), 403 (권한 없음), 404 (항목 없음), 500 (서버 오류)

## Dependencies
- **@anthropic-ai/sdk 0.39.0** — Claude Haiku (분류 모델)
- **@supabase/supabase-js@2** — DB 접근 (service role 우회 RLS)
