<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# trash/[id]

## Purpose
휴지통의 특정 항목을 복구하거나 영구삭제한다. 삭제된 항목에 대해서만 작동한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **PATCH**: 항목 복구, **DELETE**: 항목 영구삭제 |

## For AI Agents

### HTTP Methods

#### PATCH - 항목 복구
- **요청**: 파라미터 없음
- **처리**:
  1. deleted_at이 not null인 항목 조회
  2. deleted_at = null로 UPDATE (복구)
  3. 동일 항목 다시 active 상태로 전환
- **응답**: `{ entry: { 복구된 항목 } }`
- **에러**: 항목 없음 (404)

#### DELETE - 항목 영구삭제
- **요청**: 파라미터 없음
- **처리**:
  1. deleted_at is not null인 항목만 삭제 가능 (휴지통 항목만)
  2. image_url이 있으면 Storage에서 파일 삭제 (실패해도 계속)
  3. DB에서 항목 영구삭제
- **응답**: `{ success: true }`
- **에러**: 삭제 실패 (500)

### Storage Cleanup
- image_url에서 경로 추출: URL.pathname.split('/entry-images/')[1]
- Supabase Storage 'entry-images' 버킷에서 remove
- 오류 발생해도 DB 삭제는 진행

### Working In This Directory
- **인증**: requireAuth() 필수
- **동적 라우트**: params는 Promise<{ id: string }> 형식
- **Supabase 테이블**: entries
- **Storage**: entry-images 버킷
- **조건**: deleted_at is not null 필터 필수 (활성 항목 보호)

### Common Patterns
- **휴지통만**: deleted_at is not null 조건으로 휴지통 항목만 처리
- **이미지 정리**: 영구삭제 시 Storage 파일도 함께 제거
- **복구**: 휴지통에서 바로 활성 상태로 복구 (임시 상태 X)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
