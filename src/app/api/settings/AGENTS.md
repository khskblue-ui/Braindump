<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# settings

## Purpose
사용자 설정을 조회하고 수정한다. 현재는 휴지통 자동 비우기 일수(auto_purge_days)만 지원한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET**: 설정 조회, **PATCH**: 설정 수정 |

## For AI Agents

### HTTP Methods

#### GET - 설정 조회
- **요청**: 파라미터 없음
- **처리**:
  1. user_settings 테이블에서 user_id 기반 조회
  2. 없으면 기본값 반환 { auto_purge_days: 30 }
- **응답**: `{ settings: { auto_purge_days: number, ... } }`
- **에러**: DB 오류 (500, PGRST116 제외)

#### PATCH - 설정 수정
- **요청**: `{ auto_purge_days: number }`
- **검증**:
  - auto_purge_days: 정수 (0 또는 1 이상)
  - 0 = 자동 비우기 비활성화
  - 1+ = N일 후 휴지통 자동 비우기
- **처리**:
  - Upsert (없으면 생성, 있으면 수정)
  - onConflict: 'user_id'
- **응답**: `{ settings: { auto_purge_days, ... } }`
- **에러**: 유효하지 않은 값 (400), 수정 실패 (500)

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**: user_settings
- **Upsert**: 행이 없으면 생성, 있으면 수정

### Common Patterns
- **기본값**: GET 응답이 설정 행 없을 때 기본값 반환 (앱 초기화 불필요)
- **0 값**: auto_purge_days=0은 자동 비우기 비활성화 (1 이상만 활성화)
- **trash/route.ts와 연동**: GET 시점에서 auto_purge_days 로드하여 기한 초과 항목 삭제

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
