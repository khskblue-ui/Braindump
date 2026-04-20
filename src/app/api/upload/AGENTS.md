<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# upload

## Purpose
이미지 파일을 업로드하고 최적화한다. 원본 이미지를 1920px 너비로 리사이즈하여 저장하고, 400px 썸네일을 함께 생성한다. 둘 다 JPEG로 변환하여 저장하고 signed URL을 반환한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **POST**: 이미지 업로드/리사이즈/썸네일 생성 |

## For AI Agents

### HTTP Methods

#### POST - 이미지 업로드
- **요청**: FormData with `file: File` (이미지)
- **검증**:
  - file 필수
  - MIME type: image/jpeg, image/png, image/webp
  - 크기: 최대 5MB
- **처리**:
  1. **원본 리사이즈** (sharp)
     - 최대 1920px 너비 (비율 유지)
     - JPEG 품질 85
  2. **썸네일 생성** (sharp)
     - 최대 400px 너비 (비율 유지)
     - JPEG 품질 70
  3. **병렬 업로드**
     - `{user_id}/{timestamp}_main.jpg`
     - `{user_id}/{timestamp}_thumb.jpg`
     - entry-images 버킷 (upsert: false)
  4. **부분 실패 처리**
     - 한쪽 업로드만 실패 시 성공한 것 롤백
  5. **signed URL 생성**
     - 1시간 유효한 signed URL 반환
     - 만약 signed URL 생성 실패 시 public URL 폴백

- **응답**:
  ```json
  {
    "image_url": "signed_url_or_public_url",
    "image_thumbnail_url": "signed_url_or_public_url"
  }
  ```

- **에러**:
  - file 없음 (400)
  - 5MB 초과 (400)
  - JPEG/PNG/WebP 아님 (400)
  - 업로드 실패 (500)

### Image Processing Details

1. **포맷 통일**: 모든 이미지를 JPEG로 변환
   - 입력: JPEG, PNG, WebP
   - 출력: JPEG (.jpg)
   - withoutEnlargement: true (원본보다 확대 X)

2. **Quality 설정**:
   - 원본: 85 (높은 품질)
   - 썸네일: 70 (낮은 품질, 빠른 로드)

3. **크기 계산**:
   - 원본: 1920px 너비 (세로는 비율 유지)
   - 썸네일: 400px 너비 (세로는 비율 유지)

### Storage Path Structure
- Bucket: `entry-images`
- Path: `{user_id}/{timestamp}_main.jpg` (원본)
- Path: `{user_id}/{timestamp}_thumb.jpg` (썸네일)

### Working In This Directory
- **인증**: requireAuth() 필수
- **라이브러리**: sharp (이미지 리사이징)
- **Supabase Storage**: entry-images 버킷 (public read, auth write)
- **signed URL**: 1시간(3600초) 유효

### Common Patterns
- **병렬 업로드**: Promise.all로 main/thumb 동시 업로드
- **롤백**: 부분 실패 시 성공한 것 제거 (원자성 보장)
- **폴백**: signed URL 실패 시 public URL로 대체
- **타임스탬프**: 유니크성 보장 (파일명 충돌 방지)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS
- sharp - 이미지 리사이징/변환

<!-- MANUAL: -->
