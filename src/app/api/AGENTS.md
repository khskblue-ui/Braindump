<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->

# API

## Purpose
BrainDump 서버 API의 핵심 진입점. 모든 클라이언트(웹/iOS)는 이 라우트들을 통해 항목 분류, 관리, 검색, 설정을 수행한다. 각 서브디렉토리는 특정 도메인(분류, 항목, 태그, 토픽, 휴지통, 업로드)별로 구성된다.

## Key Files
이 디렉토리 자체는 라우트 파일을 가지지 않음. 모든 기능은 하위 디렉토리의 `route.ts`에 구현됨.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `classify/` | 단건 또는 일괄 항목 분류 (POST/PATCH) |
| `classify-patterns/` | 사용자의 분류 교정 이력 관리 (GET/DELETE) |
| `classify-rules/` | 사용자 정의 분류 규칙 관리 (GET/POST/DELETE) |
| `entries/` | 항목 생성/조회/검색 (POST/GET) |
| `entries/[id]/` | 특정 항목 조회/수정/삭제 (GET/PATCH/DELETE) |
| `pdf/` | PDF 업로드 및 분류 (POST) |
| `settings/` | 사용자 설정 조회/수정 (GET/PATCH) |
| `sort-orders/` | 카테고리별 항목 정렬 순서 (GET/PUT) |
| `tags/` | 모든 태그 목록 및 사용 빈도 (GET) |
| `topics/` | 지식 토픽 목록 (GET) |
| `topics/[topic]/` | 특정 토픽 항목/이름 변경 (GET/PATCH) |
| `topics/merge-similar/` | AI로 유사한 토픽 자동 병합 (POST) |
| `trash/` | 삭제된 항목 조회 및 자동 정리 (GET) |
| `trash/[id]/` | 삭제된 항목 복구/영구삭제 (PATCH/DELETE) |
| `trash/purge/` | 휴지통 전체 비우기 (DELETE) |
| `upload/` | 이미지 업로드 (POST) |

## For AI Agents

### Working In This Directory
- 모든 라우트는 `requireAuth()` 호출로 시작 (Bearer 토큰 또는 세션 쿠키 기반)
- 인증 실패 시 401 또는 NextResponse 에러 객체 반환
- Supabase 클라이언트 및 사용자 정보는 `auth` 결과에서 추출
- 모든 쿼리는 `user_id` 기준 필터링 (RLS 정책 적용)

### Testing Requirements
- 인증: Bearer 토큰 또는 세션 쿠키로 테스트
- 각 라우트는 권한 체크 후 `eq('user_id', user.id)` 필터 적용
- API 변경 시 웹과 iOS 양쪽에서 호출 가능함을 확인할 것

### Common Patterns
- **에러 응답**: 모든 라우트는 `{ error: '메시지' }` 형식 + HTTP 상태 코드 반환
- **성공 응답**: JSON 데이터 또는 `{ success: true }` 반환
- **파라미터**: query param (GET/DELETE) 또는 request body (POST/PATCH)
- **동적 라우트**: `[id]`, `[topic]` 등의 파라미터는 `params: Promise<{ ... }>` 형식으로 접근

## Dependencies

### 내부 라이브러리
- `@/lib/auth` - `requireAuth()` 인증 처리
- `@/lib/classify` - AI 분류 로직 (`classifyText`, `classifyImage`)
- `@/lib/url-validation` - URL 검증 (SSRF 방지)
- `@/lib/signed-url` - 이미지 signed URL 생성

### 외부
- Supabase JS - DB/Storage 액세스
- Anthropic SDK - AI 분류
- pdfjs-dist - PDF 텍스트 추출
- sharp - 이미지 리사이징

<!-- MANUAL: -->
