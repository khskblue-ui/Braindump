<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Postgres DDL and RLS policy evolution -->

# migrations

## Purpose
Postgres 스키마 진화 관리. 마이그레이션 파일은 **시간순으로 누적 적용**되며, 각 파일은 특정 기능 추가 또는 스키마 변경을 담당.

## Migration Timeline

| # | File | Date | Summary |
|----|------|------|---------|
| 1 | `001_category_to_categories.sql` | 2026-04-04 | `category` enum → `categories` text[] (다중 카테고리 지원) |
| 2 | `002_add_is_pinned.sql` | 2026-04-04 | `is_pinned` 컬럼 + 인덱스 (고정 기능) |
| 3 | `003_add_sort_order.sql` | 2026-04-06 | `sort_order` 컬럼 + 인덱스 (수동 정렬) |
| 4 | `004_add_user_classify_patterns.sql` | 2026-04-06 | `user_classify_patterns` 테이블 + RLS (분류 학습) |
| 5 | `005_category_sort_orders.sql` | 2026-04-06 | `entry_sort_orders` 테이블 + RLS (카테고리별 정렬) |
| 6 | `006_add_context.sql` | 2026-04-07 | `context` 컬럼 (personal/work 구분) |
| 7 | `007_add_classify_rules.sql` | 2026-04-10 | `user_classify_rules` 테이블 + RLS (사용자 정의 규칙) |

## Key Concepts

### Schema Evolution
- **단일 방향 진행**: 마이그레이션은 순서대로 한 번만 실행
- **데이터 마이그레이션 포함**: 기존 데이터 구조 변경 시 (예: enum → array)
- **인덱스 관리**: 쿼리 성능을 위해 선택적 인덱스 생성

### RLS 정책 (Row Level Security)
`user_classify_patterns`, `entry_sort_orders`, `user_classify_rules` 테이블에서:
- **SELECT**: 본인 데이터만 조회 (`auth.uid() = user_id`)
- **INSERT**: 본인 데이터만 삽입
- **UPDATE/DELETE**: 본인 데이터만 수정/삭제

### CASCADE 정책
- `user_classify_patterns.entry_id` → SET NULL (항목 삭제 시)
- `user_classify_patterns.user_id` → DELETE (사용자 삭제 시)
- `entry_sort_orders.entry_id` → DELETE
- `entry_sort_orders.user_id` → DELETE
- `user_classify_rules.user_id` → DELETE

## Migration Details

### 001_category_to_categories
**목적**: 단일 카테고리 → 다중 카테고리 지원

**주요 변경:**
- `category` enum (task/idea/memo/knowledge/schedule/inbox) → `categories` text[] 배열
- 기존 값 마이그레이션: `ARRAY[category::text]`
- 인덱스: GIN (배열 검색 최적화)
- `reminders` text[] 컬럼 추가

### 002_add_is_pinned
**목적**: 항목 고정(bookmark) 기능

**주요 변경:**
- `is_pinned` BOOLEAN DEFAULT FALSE
- 인덱스: `idx_entries_pinned` (고정 항목 빠른 조회)

### 003_add_sort_order
**목적**: 사용자 수동 정렬 위치 저장

**주요 변경:**
- `sort_order` INTEGER (NULL 허용, 미설정은 자동 정렬)
- 인덱스: `idx_entries_sort_order`

### 004_add_user_classify_patterns
**목적**: AI 분류 학습 (사용자 수정 이력 저장)

**테이블:**
```sql
user_classify_patterns (
  id, user_id, entry_id,
  original_categories, corrected_categories,
  original_tags, corrected_tags,
  original_priority, corrected_priority,
  keyword_context (첫 200자),
  created_at
)
```

**용도**: 사용자가 AI 분류를 수정할 때 기록 → 향후 분류 시 참고

### 005_category_sort_orders
**목적**: 카테고리별 개별 정렬 관리

**테이블:**
```sql
entry_sort_orders (
  id, entry_id, user_id, category, sort_order,
  created_at, updated_at
)
UNIQUE(entry_id, user_id, category)
```

**용도**: 각 카테고리 뷰에서 항목 순서 유지

### 006_add_context
**목적**: 항목의 personal/work 구분

**주요 변경:**
- `context` TEXT DEFAULT NULL (personal/work/null)
- 모든 카테고리에 적용

### 007_add_classify_rules
**목적**: 사용자 정의 분류 규칙 (우선순위 높음)

**테이블:**
```sql
user_classify_rules (
  id, user_id,
  keyword, category, context,
  created_at
)
```

**용도**: 사용자가 정의한 키워드 → 카테고리 매핑 (AI 분류 규칙 무시)

## For AI Agents

### Working In This Directory
**마이그레이션 실행:**
```bash
supabase db push  # 로컬 환경에서 마이그레이션 적용
```

**새 마이그레이션 생성:**
```bash
supabase migration new {description}  # YYYYMMDDHHMMSS_description.sql
```

### Testing Requirements
- 마이그레이션 순서 검증 (타임스탬프 또는 파일명 번호)
- 기존 데이터 무결성 확인 (특히 데이터 마이그레이션 단계)
- RLS 정책 테스트 (각 사용자는 본인 데이터만 접근)
- 인덱스 성능 검증 (큰 데이터셋에서)

### Common Patterns
- **IF NOT EXISTS**: 멱등성 확보 (여러 번 실행 가능)
- **데이터 마이그레이션**: UPDATE 후 NOT NULL 제약 추가
- **인덱스 전략**: 자주 쿼리되는 (user_id, category) 조합 중심
- **RLS 기본값**: 모든 사용자 테이블에 활성화

## Dependencies
None (순수 Postgres DDL 파일)
