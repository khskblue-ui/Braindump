<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# classify

## Purpose
항목을 AI로 분류하는 핵심 라우트. 단건 분류(POST) 또는 미분류(inbox) 항목 일괄 재분류(PATCH)를 담당한다. 사용자의 분류 교정 이력과 커스텀 규칙을 활용해 개인화된 분류 결과를 제공한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **POST**: 단건 항목 분류, **PATCH**: inbox 항목 일괄 재분류 (최대 50개, 동시성 4) |

## For AI Agents

### HTTP Methods

#### POST - 단건 분류
- **요청**: `{ entry_id: string }`
- **처리**:
  1. 사용자의 분류 교정 패턴 (user_classify_patterns) 로드
  2. 커스텀 규칙 (user_classify_rules) 로드
  3. 기존 지식 토픽 목록 로드 (knowledge 카테고리)
  4. AI로 항목 분류 (텍스트 또는 이미지)
  5. DB 업데이트: categories, tags, summary, topic, due_date, context 등
- **응답**: ClassifyResult (categories, tags, summary, topic, due_date, context)
- **에러**: 항목 없음 (404), 분류할 내용 없음 (400), 서버 오류 (500)

#### PATCH - 일괄 재분류
- **요청**: 바디 없음 (query param 없음)
- **처리**:
  1. inbox 카테고리에 속한 미분류 항목 최대 50개 조회
  2. 사용자 패턴/규칙/토픽 한 번에 로드
  3. **동시성 제한 4**로 청크 단위 병렬 처리
  4. 각 항목 분류 및 DB 업데이트
- **응답**: `{ reclassified: number, total: number, results: Array<{ id, category, error? }> }`
- **에러**: 서버 오류 (500)

### Classification Logic (공용)
모든 분류는 내부 `classifyEntryCore()` 함수 사용:

1. **이미지 우선 분류** (inputType='image'/'mixed'인 경우)
   - image_url 유효성 확인 (`isAllowedImageUrl`)
   - 이미지 fetch 및 base64 인코딩
   - `classifyImage()` 호출 (텍스트 함께 전달)
   - 실패 시 텍스트로 폴백

2. **텍스트 분류**
   - raw_text + extracted_text 병합
   - `classifyText()` 호출
   - 최대 10,000자 자르기 (smartTruncate)

3. **결과 적용** (`buildUpdateData`)
   - knowledge 포함 시에만 topic 설정
   - due_date: 기존 값이 있으면 보존 (상대날짜 드리프트 방지)
   - extracted_text: 이미지/혼합 타입만 업데이트

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**:
  - `entries` - 항목 데이터
  - `user_classify_patterns` - 교정 이력 (최대 20개 로드)
  - `user_classify_rules` - 커스텀 규칙 (최대 20개)
- **AI 호출**: Anthropic SDK (classifyText/classifyImage)
- **병렬 처리**: 동시성 4로 제한 (API 할당량 고려)

### Common Patterns
- **개인화**: 사용자 패턴과 규칙을 AI에 프롬프트로 주입
- **폴백**: 이미지 fetch 실패 시 텍스트로 자동 폴백
- **due_date 보존**: 재분류 시 기존 due_date 유지 (상대 표현 재해석 방지)
- **에러 처리**: Promise.allSettled로 부분 실패 허용

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()
- `@/lib/classify` - classifyText(), classifyImage(), smartTruncate()
- `@/lib/url-validation` - isAllowedImageUrl()

### 외부
- Supabase JS
- Anthropic SDK

<!-- MANUAL: -->
