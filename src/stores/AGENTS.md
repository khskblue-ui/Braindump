<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 -->
<!-- MANUAL: Zustand store definitions with persist + hydration patterns -->

# stores

## Purpose
클라이언트 전역 상태 관리. Zustand 5 + persist 미들웨어로 관리되는 3개 스토어. Auth, Entry 목록/필터/CRUD, 오프라인 큐 동기화.

## Key Files

| File | Purpose |
|------|---------|
| `auth-store.ts` | 사용자 인증 (로그인/회원가입/소셜 로그인/로그아웃) |
| `entry-store.ts` | 엔트리 CRUD + 필터 + 페이지네이션 + 분류 + 소팅 (persist 있음) |
| `offline-store.ts` | 오프라인 큐 (네트워크 복구 시 sync) |

## Store Details

### auth-store.ts

**역할:** Supabase Auth 세션 관리. 로그인/회원가입/소셜(Google/Apple) OAuth/로그아웃.

**API:**
```typescript
interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<(() => void) | void>;  // 구독 cleanup 함수
  signInWithEmail: (email, password) => Promise<void>;
  signUpWithEmail: (email, password) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

**특징:**
- Persist 없음 (세션 기반 로그인)
- `initialize()`는 한 번만 실행 (`initialized` 체크)
- OAuth 리다이렉트 URL: `/auth/callback`
- 로그아웃 시 서비스 워커 캐시 전체 삭제
- `onAuthStateChange` 구독으로 자동 세션 감지

### entry-store.ts

**역할:** 엔트리 목록 조회/필터/페이지네이션/CRUD/분류/소팅.

**API:**
```typescript
interface EntryStore {
  entries: Entry[];
  hasMore: boolean;
  filter: EntryFilter;
  loading: boolean;
  page: number;
  trashEntries: Entry[];
  _hydrated: boolean;
  sortMode: boolean;
  newCardStates: Map<string, NewCardState>;

  // 필터 + 조회
  setFilter: (filter: EntryFilter) => void;
  setPage: (page: number) => void;
  fetchEntries: () => Promise<void>;
  loadMore: () => void;

  // CRUD
  createEntry: (data: CreateEntryInput) => Promise<Entry>;
  updateEntry: (id, data) => Promise<void>;
  deleteEntry: (id) => Promise<void>;

  // 할 일
  toggleComplete: (id) => Promise<void>;

  // AI 분류
  classifyEntry: (id) => Promise<void>;

  // 소팅 (drag-drop)
  setSortMode: (on) => void;
  moveEntry: (entryId, direction) => Promise<void>;
  saveSortOrders: (category) => Promise<void>;

  // 휴지통
  softDelete: (id) => Promise<void>;
  restoreEntry: (id) => Promise<void>;
  fetchTrash: () => Promise<void>;
  permanentDelete: (id) => Promise<void>;
  emptyTrash: () => Promise<void>;
}
```

**특징 — 새 엔트리 5초 pinning:**
```
1. createEntry() 호출
   → 엔트리 생성
   → newCardStates Map에 { timerExpired: false, classifyDone: false } 저장
   → 5초 타이머 시작 (타이머 핸들은 newCardTimers Map에 저장)

2. 5초 후 타이머 콜백
   → timerExpired = true 로 갱신
   → tryReleaseNewCard() 호출 (양쪽 조건 체크)

3. classifyEntry() 완료
   → classifyDone = true 로 갱신
   → tryReleaseNewCard() 호출

4. 양쪽 모두 true면
   → newCardStates에서 제거
   → fetchEntries()로 서버 정렬 순서 반영
```

**특징 — Persist:**
```typescript
{
  name: 'braindump-entries',
  partialize: (state) => ({
    entries: state.entries.slice(0, 20).map(e => ({
      ...e,
      // signed URL (Expires= 또는 token=) 제거 (만료 방지)
      image_url: e.image_url?.includes('token=') ? null : e.image_url,
      image_thumbnail_url: e.image_thumbnail_url?.includes('Expires=') ? null : e.image_thumbnail_url,
    })),
  }),
  onRehydrateStorage: () => (state) => {
    if (state) {
      // 마이그레이션: category (string) → categories (array)
      state.entries = state.entries.map(e => {
        if (!e.categories && (e as any).category) {
          return { ...e, categories: [(e as any).category] };
        }
        if (!e.categories) {
          return { ...e, categories: ['inbox'] };
        }
        return e;
      });
      state._hydrated = true;
    }
  },
}
```

**특징 — Race condition 방지:**
- AbortController로 stale fetch 취소
  ```typescript
  let fetchController: AbortController | null = null;
  
  if (fetchController) fetchController.abort();
  fetchController = new AbortController();
  const { signal } = fetchController;
  
  const res = await fetch(`/api/entries?...`, { signal });
  ```

**특징 — 할 일 완료 optimistic update:**
```typescript
toggleComplete():
  1. 즉시 UI 갱신 (is_completed = true)
  2. 서버에 저장 (deleted_at 설정)
  3. 목록에서 제거
  4. 실패 시 롤백
  5. 5초 간 "되돌리기" 토스트 제공
```

### offline-store.ts

**역할:** 오프라인 상태에서 엔트리 생성을 큐에 저장했다가 네트워크 복구 시 동기화.

**API:**
```typescript
interface OfflineStore {
  queue: OfflineEntry[];
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  addToQueue: (entry: CreateEntryInput) => void;
  syncQueue: () => Promise<void>;
  removeFromQueue: (id: string) => void;
}
```

**특징:**
- Persist 있음 (`braindump-offline-queue`)
- offline entry: CreateEntryInput + UUID id + created_at 타임스탬프
- `setOnline(true)` 호출 시 자동 `syncQueue()`
- 동기화 중 네트워크 실패 → 멈춤 (partial sync 허용)
- 성공한 항목만 제거

## For AI Agents

### Working In This Directory

**Zustand 스토어 수정 시:**

1. **인터페이스 변경**
   - 필드 추가 → persist 설정 확인 (저장할 필드만 `partialize`)
   - 필드 제거 → `onRehydrateStorage`에서 마이그레이션 처리

2. **persist 키 변경 금지**
   - 이미 저장된 localStorage 데이터 손실
   - 필요시 마이그레이션 함수 추가

3. **비동기 작업**
   - fetch 호출 시 AbortController 사용 (entry-store 참고)
   - 에러 처리는 toast로 사용자에게 알림

### Testing Requirements

**Auth store:**
```bash
# 로그인 + 세션 구독 확인
useAuthStore.getState().initialize();
useAuthStore.getState().signInWithEmail('test@example.com', 'password');
# 상태 확인: user !== null
```

**Entry store:**
```bash
# persist 복구 테스트
1. 개발자 도구 → 응용 프로그램 → localStorage → braindump-entries 확인
2. 페이지 새로고침 → 캐시된 엔트리 로드됨
3. 마이그레이션: category vs categories 배열 형식 확인

# race condition 방지
1. 빠르게 여러 번 필터 변경
2. 마지막 fetch만 완료되는지 확인 (이전 요청은 abort)

# 새 엔트리 pinning
1. 엔트리 생성 → 맨 위에 표시
2. 분류 중 삭제 → 타이머 정리됨 (leak 없음)
3. 5초 후 → 서버 순서로 재정렬
```

**Offline store:**
```bash
# 오프라인 큐
1. navigator.onLine = false 시뮬레이션
2. addToQueue() 호출 → localStorage 저장됨
3. navigator.onLine = true 시뮬레이션
4. syncQueue() 자동 호출 → 엔트리 생성됨
```

### Common Patterns

**스토어 구독:**
```typescript
'use client';
import { useEntryStore } from '@/stores/entry-store';

export function MyComponent() {
  const entries = useEntryStore(s => s.entries);
  const filter = useEntryStore(s => s.filter);
  const setFilter = useEntryStore(s => s.setFilter);
  // ...
}
```

**Persist 마이그레이션:**
```typescript
{
  name: 'store-key',
  version: 1, // 버전 관리
  migrate: (state, version) => {
    if (version === 0) {
      return { ...state, newField: defaultValue };
    }
    return state;
  },
  onRehydrateStorage: () => (state) => {
    // 런타임 정규화
    if (state) {
      state._hydrated = true;
    }
  },
}
```

**비동기 error handling:**
```typescript
try {
  await store.fetchEntries();
} catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    // 의도적 취소 — 무시
    return;
  }
  toast.error('엔트리 조회 실패');
}
```

## Dependencies

### Internal
- `@/types` — Entry, CreateEntryInput, UpdateEntryInput, EntryCategory 등

### External
- **zustand** v5 — 상태 관리
- **zustand/middleware** — persist
- **sonner** — toast 알림
- **@supabase/supabase-js** — Auth 타입 (User)

---

**핵심 패턴 요약:**
1. **새 엔트리 5초 pinning** — 분류 완료까지 맨 위 유지
2. **persist + 마이그레이션** — 캐시 복구 시 스키마 변경 대응
3. **race condition 방지** — AbortController로 stale 요청 취소
4. **optimistic update** — 할 일 완료 즉시 표시, 실패 시 롤백
5. **오프라인 큐** — 네트워크 복구 시 자동 동기화
