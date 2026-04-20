<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# tags

## Purpose
사용자가 사용한 모든 태그의 목록과 각 태그의 사용 빈도를 조회한다. 태그 클라우드, 자동완성, 필터 UI 등에 활용된다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET**: 사용자의 모든 태그와 빈도 |

## For AI Agents

### HTTP Methods

#### GET - 태그 목록 조회
- **요청**: 파라미터 없음
- **처리**:
  1. 사용자의 모든 entries에서 tags 컬럼 조회 (삭제되지 않은 항목만)
  2. 모든 태그를 순회하며 카운트
  3. 빈도순 정렬 (count DESC)
- **응답**: `{ tags: Array<{ name: string, count: number }> }`
- **에러**: 없음 (조회 실패 시에도 빈 배열 반환)

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**: entries (tags 컬럼, text[] 타입)
- **필터링**: deleted_at is null (삭제된 항목 제외)

### Common Patterns
- **JS 후처리**: 모든 항목의 tags를 로드하여 JS에서 카운팅 (DB 함수 X)
- **정렬**: count DESC (가장 많이 사용된 태그부터)
- **확장성**: 항목 수가 많아지면 성능 고려 필요 (현재는 전체 로드)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
