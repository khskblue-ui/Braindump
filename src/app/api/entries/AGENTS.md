<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# entries

## Purpose
항목의 생성과 조회/검색을 담당하는 핵심 라우트. 사용자가 텍스트, 이미지, PDF를 등록하고, 카테고리/태그/검색으로 필터링하여 조회한다. 정렬(pinned → sort_order → created_at), 페이지네이션, 복합 검색(텍스트+태그)을 지원한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **POST**: 항목 생성, **GET**: 항목 조회/검색/필터링 |

## For AI Agents

### HTTP Methods

#### POST - 항목 생성
- **요청**: `{ raw_text?: string, image_url?: string, image_thumbnail_url?: string, input_type?: string }`
- **검증**:
  - raw_text 또는 image_url 필수
  - image_url/image_thumbnail_url: SSRF 검증 (`isAllowedImageUrl`)
- **처리**:
  1. entries 테이블에 삽입
  2. categories: ['inbox'] (미분류 상태)
  3. input_type 저장: 'text', 'image', 'mixed', 'pdf' 등
- **응답**: `{ entry: { id, user_id, raw_text, image_url, categories, ... } }`
- **에러**: 텍스트/이미지 없음 (400), 부정 URL (400), 생성 실패 (500)

#### GET - 항목 조회/검색
- **요청**: query params
  - `category`: 카테고리 필터 ('task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox', 'all')
  - `tag`: 태그 필터 (단일 태그)
  - `context`: 'personal' 또는 'work' (context 필터 또는 null 항목 포함)
  - `q`: 검색어 (텍스트 또는 태그)
  - `page`: 페이지 번호 (기본 1, 최대 1000)
  - `limit`: 페이지 크기 (기본 20, 최대 100)

- **정렬**:
  1. **pinned 항목** 최상단
  2. **카테고리별 sort_order** (entry_sort_orders 테이블)
  3. **created_at DESC** (최신순)
  4. **schedule 카테고리 특수**: upcoming (due_date >= now) → noDue → past (due_date < now)

- **검색 (q 파라미터)**:
  - 텍스트 검색: raw_text, summary, extracted_text, topic (ilike)
  - 태그 검색: JS 후필터링 (PostgREST의 text[] ilike 미지원)
  - 텍스트와 태그 결과 병합 (중복 제거)

- **응답**:
  ```json
  {
    "entries": [{ 항목들 with signed URLs }],
    "hasMore": boolean,
    "page": number
  }
  ```

- **에러**: 검색 실패 (500), 조회 실패 (500)

### Special Handling

1. **Signed URLs**: 모든 응답 항목에 `attachSignedUrls()` 적용 (이미지 접근 권한)
2. **schedule 정렬**: 미래 일정 → 기한 없음 → 과거 일정 (별도 JS 정렬)
3. **컨텍스트 필터**: `.or()` 사용으로 context=param OR context=null 조건
4. **태그 검색**: PostgREST의 text[] ilike 제약 우회 (JS 필터링)

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**:
  - `entries` - 항목 데이터
  - `entry_sort_orders` - 카테고리별 정렬 순서
- **RLS**: user_id 기반 필터링
- **signed URLs**: Supabase Storage 임시 접근 URL 생성

### Common Patterns
- **생성**: 항목 등록 즉시 inbox로 설정 (분류는 별도)
- **필터링**: 카테고리/태그 중복 사용 가능 (AND 조건)
- **페이지네이션**: limit+1 요청으로 hasMore 판단 (오프셋 기반)
- **검색**: 텍스트/태그 병렬 조회 후 JS로 병합 (PostgREST 제약 우회)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()
- `@/lib/signed-url` - attachSignedUrls()
- `@/lib/url-validation` - isAllowedImageUrl()

### 외부
- Supabase JS

<!-- MANUAL: -->
