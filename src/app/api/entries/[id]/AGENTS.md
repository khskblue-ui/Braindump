<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# entries/[id]

## Purpose
특정 항목의 조회, 수정, 삭제를 담당한다. 사용자는 분류 결과, 태그, 제목, 마감일, 우선순위, 완료 상태 등을 수정할 수 있다. 수정 시 AI 분류와의 차이를 패턴으로 기록하여 향후 분류 개인화에 활용한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET**: 항목 조회, **PATCH**: 항목 수정, **DELETE**: 항목 삭제 |

## For AI Agents

### HTTP Methods

#### GET - 항목 조회
- **요청**: 파라미터 없음 (ID는 URL 경로)
- **처리**:
  1. 항목 조회 (user_id + id 기반)
  2. signed URL 생성
- **응답**: `{ entry: { ... with signed URL } }`
- **에러**: 항목 없음 (404)

#### PATCH - 항목 수정
- **요청**: `{ field1: value1, field2: value2, ... }`
- **허용 필드**: raw_text, extracted_text, categories, tags, topic, summary, due_date, priority, is_completed, is_pinned, deleted_at, reminders, context
- **검증**: 업데이트할 필드 하나 이상 필수
- **처리**:
  1. 원본 항목 조회 (categories, tags, priority, raw_text)
  2. 필드 업데이트
  3. **자동 패턴 기록**: categories 또는 tags 변경 시 `recordClassifyPattern()` 호출
- **응답**: `{ entry: { 수정된 항목 } }`
- **에러**: 수정할 필드 없음 (400), 항목 없음 (404), 수정 실패 (500)

#### DELETE - 항목 삭제
- **요청**: 파라미터 없음
- **처리**:
  1. 항목의 image_url 추출
  2. Storage에서 이미지 파일 삭제 (실패해도 계속)
  3. DB에서 항목 영구 삭제
- **응답**: `{ success: true }`
- **에러**: 삭제 실패 (500)

### Pattern Recording
`recordClassifyPattern()` 함수로 자동 기록되는 사항:
- **조건**: categories 또는 tags가 변경되었을 때만
- **저장**: original_categories, corrected_categories, original_tags, corrected_tags, keyword_context
- **용도**: `classify/route.ts`에서 로드하여 AI 분류 개인화에 사용

### Working In This Directory
- **인증**: requireAuth() 필수
- **동적 라우트**: params는 Promise<{ id: string }> 형식
- **Supabase 테이블**:
  - `entries` - 항목 데이터
  - `user_classify_patterns` - 분류 교정 패턴 (자동 기록)
- **Storage**: entry-images 버킷에서 이미지 파일 삭제

### Common Patterns
- **소프트 삭제 아님**: DB에서 항목 영구 삭제 (deleted_at 없음)
- **이미지 정리**: 항목 삭제 시 저장소 파일도 함께 삭제
- **분류 교정**: categories/tags 변경 자동 감지 및 기록
- **필드 화이트리스트**: 허용 필드만 업데이트 (ai_metadata 수정 불가)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()
- `@/lib/signed-url` - attachSignedUrls()

### 외부
- Supabase JS

<!-- MANUAL: -->
