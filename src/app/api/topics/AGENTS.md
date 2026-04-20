<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# topics

## Purpose
사용자가 학습 중인 지식 토픽의 목록을 조회한다. 각 토픽은 최신 등록 시간과 항목 수를 포함한다. 토픽 클라우드, 지식 브라우징, merge-similar 기능의 입력 데이터로 활용된다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET**: 사용자의 모든 지식 토픽과 통계 |

## For AI Agents

### HTTP Methods

#### GET - 토픽 목록 조회
- **요청**: 파라미터 없음
- **처리**:
  1. entries에서 knowledge 카테고리이고 topic이 있는 항목만 조회
  2. 모든 토픽을 순회하며:
     - count: 같은 토픽의 항목 수
     - latest: 가장 최신 항목의 created_at
  3. latest DESC로 정렬 (최근 활동 토픽부터)
- **응답**: `{ topics: Array<{ name: string, count: number, latest: ISO8601 }> }`
- **에러**: 없음

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**: entries
- **필터링**:
  - deleted_at is null (삭제 항목 제외)
  - categories contains ['knowledge']
  - topic is not null
- **정렬**: created_at DESC (각 토픽 내), latest DESC (전체 토픽)

### Common Patterns
- **토픽 통계**: count와 latest로 토픽별 활동 추적
- **JS 후처리**: 모든 knowledge 항목 로드 후 JS로 토픽 그룹화 및 통계 계산
- **merge-similar의 입력**: 모든 토픽 목록과 샘플 항목으로 AI가 유사성 분석

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
