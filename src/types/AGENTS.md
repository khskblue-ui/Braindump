<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Shared type definitions (Entry, ClassifyResult, Category, etc.) -->

# types

## Purpose
웹과 iOS가 공유하는 타입 정의. Entry 스키마, 분류 결과, 카테고리 메타데이터, 입력 유형, 리마인더 옵션. TypeScript strict 모드에서 컴파일.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | 모든 공유 타입 (Entry, ClassifyResult, Category 정의 + 상수) |
| `next-pwa.d.ts` | PWA 타입 선언 (NavigationPreloadManager) |
| `speech.d.ts` | Web Speech API 타입 선언 (SpeechRecognition) |

---

## File Details

### index.ts (핵심)

**카테고리 유형:**
```typescript
export type EntryCategory = 'task' | 'idea' | 'memo' | 'knowledge' | 'schedule' | 'inbox';
```

| 카테고리 | 의미 | 예 |
|---------|------|------|
| `task` | 완료할 수 있는 행동 | "보고서 제출", "우유 사기" |
| `idea` | 실행 여부 미정 생각 | "앱에 다크모드 넣으면 좋겠다" |
| `memo` | 참고용 기록 | "어제 회의 기록", "링크 저장" |
| `knowledge` | 학습 정보/지식 | "미토콘드리아의 역할", "React 훅" |
| `schedule` | 특정 날짜/시간이 있는 항목 | "내일 3시 회의", "생일" |
| `inbox` | 분류 불가 | 판단 불가능한 입력 |

**입력 유형:**
```typescript
export type EntryInputType = 'text' | 'image' | 'mixed' | 'pdf';
```

**우선순위:**
```typescript
export type EntryPriority = 'high' | 'medium' | 'low';
```

**컨텍스트:**
```typescript
export type EntryContext = 'personal' | 'work';
```

| 컨텍스트 | 의미 |
|---------|------|
| `personal` | 개인 생활, 취미, 건강 |
| `work` | 업무, 회사, 직장 관련 |

**리마인더:**
```typescript
export type ReminderOption = '1week' | '2days' | '1day' | '1hour' | '10min';

export const REMINDER_OPTIONS = [
  { value: '1week', label: '1주일 전', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: '2days', label: '2일 전', ms: 2 * 24 * 60 * 60 * 1000 },
  // ... 등등
];
```

**Entry 인터페이스:**
```typescript
export interface Entry {
  id: string;                      // UUID
  user_id: string;                 // 소유자
  raw_text: string | null;         // 원본 텍스트
  image_url: string | null;        // 이미지 URL (Supabase Storage)
  image_thumbnail_url: string | null; // 썸네일 URL
  extracted_text: string | null;   // 이미지에서 추출한 텍스트
  categories: EntryCategory[];     // 1~3개 카테고리
  tags: string[];                  // 태그 (배열)
  topic: string | null;            // knowledge 토픽
  summary: string | null;          // 짧은 요약 (15자 이내)
  due_date: string | null;         // ISO8601 (schedule 포함 시)
  priority: EntryPriority | null;  // 우선순위
  is_completed: boolean;           // 완료 여부
  is_pinned: boolean;              // 핸 여부
  reminders: ReminderOption[];     // 리마인더 옵션 배열
  input_type: EntryInputType;      // text/image/mixed/pdf
  context: EntryContext | null;    // personal/work
  ai_metadata: Record<string, unknown>; // AI 메타데이터 (확장용)
  deleted_at: string | null;       // soft delete 타임스탬프
  created_at: string;              // ISO8601
  updated_at: string;              // ISO8601
}
```

**생성/수정 입력:**
```typescript
export interface CreateEntryInput {
  raw_text?: string;               // 텍스트 입력
  image_url?: string;              // 이미지 URL
  image_thumbnail_url?: string;    // 썸네일
  input_type: EntryInputType;      // 필수
}

export interface UpdateEntryInput {
  raw_text?: string;
  categories?: EntryCategory[];
  tags?: string[];
  topic?: string | null;
  summary?: string | null;
  due_date?: string | null;
  priority?: EntryPriority | null;
  is_completed?: boolean;
  is_pinned?: boolean;
  context?: EntryContext | null;
  deleted_at?: string | null;
  reminders?: ReminderOption[];
  // ai_metadata는 클라이언트에서 수정 불가 (서버 전용)
}
```

**분류 결과:**
```typescript
export interface ClassifyResult {
  categories: EntryCategory[];     // 1~3개 (필수)
  tags: string[];                  // 최대 5개
  topic?: string;                  // knowledge 포함 시만
  extracted_text?: string;         // 이미지 OCR 결과
  summary?: string;                // 15자 이내
  due_date?: string;               // ISO8601 (schedule 포함 시)
  context?: EntryContext;          // personal/work
  related_topics?: string[];       // 관련 주제
}
```

**정렬 메타데이터:**
```typescript
export interface CategorySortOrder {
  entry_id: string;
  category: string;
  sort_order: number;
}
```

**주제 + 태그 정보:**
```typescript
export interface TopicInfo {
  name: string;                    // 주제명
  count: number;                   // 해당 주제의 엔트리 개수
  latest: string;                  // 최신 업데이트 타임스탐프
}

export interface TagInfo {
  name: string;
  count: number;
}
```

**카테고리 메타데이터:**
```typescript
export const CATEGORIES = [
  { value: 'task', label: '할 일', color: '#3B82F6' },
  { value: 'idea', label: '아이디어', color: '#EAB308' },
  { value: 'memo', label: '메모', color: '#22C55E' },
  { value: 'knowledge', label: '지식', color: '#A855F7' },
  { value: 'schedule', label: '일정', color: '#F97316' },
  { value: 'inbox', label: '미분류', color: '#9CA3AF' },
];

export const CATEGORY_MAP = {
  task: { value: 'task', label: '할 일', color: '#3B82F6' },
  // ... 등등
};
```

**유틸 함수:**
```typescript
/** 엔트리의 주 카테고리 (첫 번째) 반환 */
export function primaryCategory(
  entry: { categories?: EntryCategory[] }
): EntryCategory {
  return entry.categories?.[0] || 'inbox';
}

/** 엔트리가 특정 카테고리에 속하는지 확인 */
export function hasCategory(
  entry: { categories?: EntryCategory[] },
  cat: EntryCategory
): boolean {
  return entry.categories?.includes(cat) ?? false;
}
```

### next-pwa.d.ts

**PWA 타입 선언:**
```typescript
declare global {
  interface ServiceWorkerContainer {
    controller: ServiceWorker | null;
    ready: Promise<ServiceWorkerRegistration>;
    oncontrollerchange: ((this: ServiceWorkerContainer, ev: Event) => unknown) | null;
    // ... 메서드들
  }

  interface NavigationPreloadManager {
    enable(): Promise<void>;
    disable(): Promise<void>;
    getState(): Promise<{ enabled: boolean }>;
  }
}
```

**사용:** Service Worker navigation preload 설정.

### speech.d.ts

**Web Speech API 타입 선언:**
```typescript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  class SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
    onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  }

  interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
  }

  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
  }
}
```

**사용:** 음성 입력 (브라우저 마이크).

---

## For AI Agents

### Working In This Directory

**타입 추가 시:**

1. **인터페이스 정의**
   ```typescript
   export interface NewType {
     field1: string;
     field2: number | null;
   }
   ```

2. **타입 가드 함수 추가** (필요시)
   ```typescript
   export function isNewType(obj: unknown): obj is NewType {
     return (
       typeof obj === 'object' &&
       obj !== null &&
       'field1' in obj &&
       'field2' in obj
     );
   }
   ```

3. **상수 정의**
   ```typescript
   export const NEW_TYPE_OPTIONS = [
     { value: 'opt1', label: '옵션 1' },
   ];
   ```

4. **Export 확인**
   - `src/types/index.ts`에서만 모든 타입 정의
   - `next-pwa.d.ts`, `speech.d.ts`는 declare global만 포함

### Testing Requirements

**타입 호환성:**
```typescript
// tsc --noEmit으로 타입 검증
// Entry와 CreateEntryInput 호환성 확인
const entry: Entry = { /* ... */ };
const input: CreateEntryInput = { /* ... */ };
// ✓ 타입 오류 없음
```

**유틸 함수:**
```typescript
test('primaryCategory should return first category', () => {
  const entry: Entry = { categories: ['task', 'idea'], /* ... */ };
  expect(primaryCategory(entry)).toBe('task');
});

test('hasCategory should check category membership', () => {
  const entry: Entry = { categories: ['task'], /* ... */ };
  expect(hasCategory(entry, 'task')).toBe(true);
  expect(hasCategory(entry, 'idea')).toBe(false);
});
```

### Common Patterns

**Entry 타입 서로 호환:**
```typescript
// 새 엔트리 생성
const input: CreateEntryInput = {
  raw_text: '내일 회의',
  input_type: 'text',
};

// API 응답 → Entry 객체
const entry: Entry = {
  ...input,
  id: 'uuid',
  user_id: 'user-uuid',
  categories: ['schedule'],
  tags: [],
  summary: '내일 회의',
  is_completed: false,
  is_pinned: false,
  // ... 기타 필드
};
```

**분류 결과 적용:**
```typescript
const classifyResult: ClassifyResult = {
  categories: ['schedule', 'task'],
  tags: ['회의'],
  summary: '내일 10시 팀 미팅',
  due_date: '2026-04-21T10:00:00+09:00',
};

// Entry 업데이트
const update: UpdateEntryInput = {
  categories: classifyResult.categories,
  tags: classifyResult.tags,
  summary: classifyResult.summary,
  due_date: classifyResult.due_date,
};
```

**카테고리 UI:**
```typescript
import { CATEGORY_MAP } from '@/types';

export function CategoryBadge({ category }: { category: EntryCategory }) {
  const meta = CATEGORY_MAP[category];
  return <span style={{ color: meta.color }}>{meta.label}</span>;
}
```

---

## Dependencies

### Internal
없음 (타입 정의만)

### External
- **TypeScript** — 타입 검사

---

## Technical Notes

### 데이터베이스 매핑

**PostgreSQL `entries` 테이블:**

| 열 | TypeScript 타입 | DB 타입 | 제약 |
|----|------------------|---------|------|
| `id` | `string` (UUID) | `uuid` | PK |
| `user_id` | `string` (UUID) | `uuid` | FK users |
| `raw_text` | `string \| null` | `text` | — |
| `image_url` | `string \| null` | `text` | URL |
| `categories` | `EntryCategory[]` | `text[]` | ⚠️ ilike 불가 |
| `tags` | `string[]` | `text[]` | ⚠️ ilike 불가 |
| `summary` | `string \| null` | `text` | — |
| `due_date` | `string \| null` | `timestamp with tz` | ISO8601 |
| `context` | `EntryContext \| null` | `text` | — |
| `deleted_at` | `string \| null` | `timestamp with tz` | soft delete |
| `created_at` | `string` | `timestamp with tz` | — |
| `updated_at` | `string` | `timestamp with tz` | — |

### 배열 컬럼 검색 제약

**문제:** `categories`, `tags` 는 `text[]` 배열.

**PostgREST 제약:**
- `.ilike()` 직접 사용 불가 (오류 42883)
- `.or()` 내에서 `::` 캐스트 불가 (오류 PGRST100)

**해결책:**
1. **JS 포스트필터링:**
   ```typescript
   const entries = await supabase.from('entries').select('*');
   const filtered = entries.filter(e => e.tags.includes(searchTerm));
   ```

2. **DB 함수:**
   ```sql
   CREATE FUNCTION search_by_tag(tag TEXT) RETURNS TABLE(...) AS $$
   BEGIN
     RETURN QUERY SELECT * FROM entries WHERE tags @> ARRAY[tag];
   END;
   ```

---

**참고:** `../AGENTS.md`의 Technical Constraints 섹션에서 배열 검색 상세 가이드 확인
