<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# classify-patterns

## Purpose
사용자의 AI 분류 교정 이력을 관리한다. 사용자가 항목을 수동으로 수정할 때마다 원본 분류와 수정된 분류를 패턴으로 기록하여, 향후 분류 시 개인화 신호로 활용한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET**: 교정 패턴 목록, **DELETE**: 단건 또는 전체 삭제 |

## For AI Agents

### HTTP Methods

#### GET - 교정 패턴 조회
- **요청**: 파라미터 없음
- **응답**: `{ patterns: Array<{ id, original_categories, corrected_categories, original_tags, corrected_tags, keyword_context, created_at }> }`
- **정렬**: created_at DESC (최신순)
- **에러**: 조회 실패 (500)

#### DELETE - 패턴 삭제
- **요청**: query param `id` (패턴 ID) 또는 `id=all` (전체)
- **처리**:
  - `id=all`: 사용자의 모든 패턴 삭제
  - `id={pattern_id}`: 특정 패턴만 삭제
- **응답**: `{ success: true }`
- **에러**: id 누락 (400), 삭제 실패 (500)

### How Patterns Are Created
`entries/[id]/` PATCH 핸들러에서 호출되는 `recordClassifyPattern()` 함수로 자동 기록:
- 카테고리 또는 태그가 변경되었을 때만 기록
- 원본 분류, 수정 분류, 키워드 컨텍스트(raw_text 첫 200자) 저장

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**: `user_classify_patterns`
- **RLS**: user_id 기반 필터링 (다른 사용자 패턴 접근 불가)

### Common Patterns
- **폐기**: 사용자가 교정을 취소하거나 초기화하고 싶을 때 DELETE로 특정 패턴 삭제
- **초기화**: `id=all`로 전체 학습 이력 리셋 가능
- **조회**: 패턴 목록으로 사용자의 분류 행동 분석 가능

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
