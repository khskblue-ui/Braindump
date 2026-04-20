<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# classify-rules

## Purpose
사용자가 정의한 커스텀 분류 규칙을 관리한다. "React 키워드가 나오면 반드시 idea 포함" 같은 규칙을 설정하여 AI 분류를 보정한다. 분류 시점에 이 규칙들을 프롬프트로 주입하여 개인화된 분류 결과를 도출한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET**: 규칙 목록, **POST**: 규칙 추가, **DELETE**: 규칙 삭제 |

## For AI Agents

### HTTP Methods

#### GET - 규칙 조회
- **요청**: 파라미터 없음
- **응답**: `{ rules: Array<{ id, keyword, category, context, created_at }> }`
- **정렬**: created_at DESC (최신순)
- **에러**: 조회 실패 (500)

#### POST - 규칙 추가
- **요청**: `{ keyword: string, category: string, context?: 'personal' | 'work' }`
- **검증**:
  - keyword: 필수, 공백 제거
  - category: 필수, ['task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox'] 중 하나
  - context: 선택, task/schedule 카테고리인 경우만 personal/work 지정 가능
- **제한**: 사용자당 최대 50개 규칙
- **응답**: `{ rule: { id, keyword, category, context, created_at } }` (201)
- **에러**: keyword 누락 (400), 카테고리 무효 (400), 규칙 수 초과 (400), 추가 실패 (500)

#### DELETE - 규칙 삭제
- **요청**: query param `id` (규칙 ID)
- **처리**: 지정된 규칙 삭제 (user_id 기반 검증)
- **응답**: `{ success: true }`
- **에러**: id 누락 (400), 삭제 실패 (500)

### How Rules Are Used
`classify/route.ts`의 `fetchUserRules()` 함수로 로드:
- 최신 20개만 로드 (성능)
- 프롬프트 문자열로 포매팅: `"keyword" → 반드시 category 포함, context를 "context"로 설정`
- AI 호출 시 userRules 파라미터로 전달

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**: `user_classify_rules`
- **RLS**: user_id 기반 필터링
- **제한**: 50개 규칙 상한선 (성능 고려)

### Common Patterns
- **키워드 기반**: 특정 단어 포함 시 항상 특정 카테고리 포함하도록 강제
- **컨텍스트 분리**: 같은 키워드도 개인/회사 상황에 따라 다른 분류 가능
- **간단함**: 정규식 없음, 문자열 부분 매칭만 지원 (AI에 맡김)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
