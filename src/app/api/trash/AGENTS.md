<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# trash

## Purpose
삭제된 항목(휴지통)을 조회하고 자동 정리한다. 사용자 설정에 따라 기한 초과 항목을 자동 영구삭제하고, 남은 항목들을 반환한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET**: 휴지통 항목 조회 (자동 정리 포함) |

## For AI Agents

### HTTP Methods

#### GET - 휴지통 항목 조회
- **요청**: 파라미터 없음
- **처리**:
  1. **자동 정리**
     - user_settings에서 auto_purge_days 로드 (기본 30)
     - auto_purge_days > 0이면: deleted_at < (now - N일) 항목 영구삭제
  2. **남은 항목 조회**
     - deleted_at is not null 항목만
     - deleted_at DESC로 정렬 (최근 삭제순)
  
- **응답**: `{ entries: Array<{ 휴지통 항목들 }> }`
- **에러**: 조회 실패 (500)

### Integration with settings
- **auto_purge_days**: user_settings에서 로드 (기본 30)
  - 0: 자동 정리 비활성화
  - 1+: N일 후 자동 삭제
- **타이밍**: trash GET 호출 시점에 정리 실행 (크론 X)

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**:
  - entries (deleted_at is not null)
  - user_settings (auto_purge_days 로드)
- **쿼리**: lt('deleted_at', cutoff) 및 not('deleted_at', 'is', null)

### Common Patterns
- **지연된 정리**: 사용자가 휴지통 페이지 방문할 때 자동 정리
- **선택적 정리**: auto_purge_days=0이면 수동으로 영구삭제 (트리거 X)
- **안전성**: GET 호출이 삭제를 실행하므로 멱등성 보장 필요

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
