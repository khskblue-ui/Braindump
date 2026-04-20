<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# topics/[topic]

## Purpose
특정 토픽에 속한 항목들을 조회하고, 토픽의 이름을 변경한다. 토픽 상세 페이지, 토픽 이름 편집, 대량 항목 업데이트에 활용된다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET**: 토픽 항목 조회, **PATCH**: 토픽 이름 변경 |

## For AI Agents

### HTTP Methods

#### GET - 토픽 항목 조회
- **요청**: URL 경로 `[topic]` (URL 인코딩)
- **처리**:
  1. topic을 decodeURIComponent로 디코딩
  2. entries에서 user_id + topic + deleted_at is null 기반 조회
  3. created_at DESC로 정렬
- **응답**: `{ entries: Array<{ ... }> }`
- **에러**: 조회 실패 (500)

#### PATCH - 토픽 이름 변경
- **요청**:
  - URL 경로: `[topic]` (기존 토픽명, URL 인코딩)
  - Body: `{ name: string }` (새로운 토픽명)
- **검증**:
  - name 필수, 공백 제거, 소문자 변환
  - 기존과 같은 이름: 스킵 (updated: 0)
- **처리**:
  1. oldTopic을 decodeURIComponent로 디코딩
  2. newName 정규화 (trim, toLowerCase)
  3. 모든 항목의 topic을 newName으로 일괄 업데이트
  4. user_id + oldTopic + deleted_at is null 필터
- **응답**: `{ success: true, updated: number }`
- **에러**: name 누락 (400), 변경 실패 (500)

### Path Parameter Encoding
- URL에서 topic 파라미터는 URI 인코딩되어 전달됨
- 반드시 decodeURIComponent()로 디코딩 후 DB 쿼리
- 예: "React Hooks" → "React%20Hooks" → "React Hooks"

### Working In This Directory
- **인증**: requireAuth() 필수
- **동적 라우트**: params는 Promise<{ topic: string }> 형식
- **Supabase 테이블**: entries
- **대량 업데이트**: 같은 topic을 가진 모든 항목 일괄 변경

### Common Patterns
- **소문자 정규화**: topic은 항상 소문자 저장 (DB 일관성)
- **여러 항목 영향**: 한 토픽 이름 변경이 같은 토픽의 모든 항목에 영향
- **순환 참조 주의**: A → B → A 같은 토픽명 변경 체인은 없음 (각 변경은 1회)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
