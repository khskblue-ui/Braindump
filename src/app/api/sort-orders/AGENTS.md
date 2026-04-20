<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-19 -->

# sort-orders

## Purpose
카테고리별 항목의 커스텀 정렬 순서를 관리한다. 사용자가 드래그 앤 드롭으로 항목 순서를 변경하면, sort_order 값으로 저장된다. entries GET 응답 시 이 순서를 적용하여 사용자가 설정한 순서대로 표시한다.

## Key Files
| File | Description |
|------|-------------|
| `route.ts` | **GET**: 카테고리별 정렬 순서 조회, **PUT**: 정렬 순서 저장 |

## For AI Agents

### HTTP Methods

#### GET - 정렬 순서 조회
- **요청**: query param `category` (카테고리명, 필수)
- **처리**:
  1. entry_sort_orders에서 user_id + category 기반 조회
  2. sort_order ASC로 정렬 (순서대로)
- **응답**: `{ sortOrders: Array<{ entry_id, sort_order }> }`
- **에러**: category 누락 (400), 조회 실패 (500)

#### PUT - 정렬 순서 저장
- **요청**: `{ category: string, orders: Array<{ entry_id, sort_order }> }`
- **검증**:
  - category 필수
  - orders 필수 (배열)
  - 모든 entry_id가 사용자 소유 확인 (권한 검증)
- **처리**:
  1. 입력된 entry_id들이 현재 사용자 소유인지 검증
  2. 소유한 항목만 필터링
  3. Upsert: onConflict: 'entry_id,user_id,category'
  4. updated_at 자동 갱신
- **응답**: `{ success: true }`
- **에러**: category/orders 누락 (400), 유효한 항목 없음 (400), 저장 실패 (500)

### Integration with entries GET
entries GET 응답 시 정렬 적용 로직:
1. 카테고리 필터링이 활성화된 경우 entry_sort_orders 로드
2. catSortMap 생성 (entry_id → sort_order)
3. 정렬 우선순위:
   - 1순위: is_pinned (pinned 먼저)
   - 2순위: sort_order (catSortMap에 있으면)
   - 3순위: created_at DESC (기본)

### Working In This Directory
- **인증**: requireAuth() 필수
- **Supabase 테이블**: entry_sort_orders
- **권한**: entry_id 소유 검증 (다른 사용자 항목 정렬 불가)
- **Upsert**: 겹치는 키에 대해 UPDATE, 없으면 INSERT

### Common Patterns
- **드래그 앤 드롭**: 프론트엔드에서 재정렬 후 PUT으로 전체 orders 배열 전송
- **부분 저장**: 일부 항목만 보낼 수 있음 (나머지는 sort_order 없음)
- **비용 최적화**: 필요한 카테고리만 정렬 순서 저장 (모든 항목에 order 강제 X)

## Dependencies

### 내부
- `@/lib/auth` - requireAuth()

### 외부
- Supabase JS

<!-- MANUAL: -->
