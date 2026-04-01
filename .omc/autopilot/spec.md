# BrainDump — Technical Specification & Requirements

## 1. Project Overview

**BrainDump**는 AI 기반 생각 정리 PWA. 텍스트/이미지 입력 → Claude AI 자동 분류 → 지식 체계화.

- **Tech Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS + shadcn/ui, Zustand, Supabase (PostgreSQL + Storage + Auth), Claude API (Haiku + Vision), next-pwa, Vercel
- **Target**: 모바일 퍼스트 PWA, 한국어 우선

---

## 2. Architecture Overview

```
Client (PWA)                    Server (Next.js API Routes)         External
┌─────────────────┐            ┌──────────────────────┐           ┌──────────┐
│ App Shell        │───────────│ /api/entries          │───────────│ Supabase │
│ Quick Capture    │           │ /api/classify         │           │ (DB+Auth │
│ Dashboard        │           │ /api/upload           │           │  +Store) │
│ Knowledge View   │           │ /api/tags             │           └──────────┘
│ Zustand Store    │           │ /api/topics           │           ┌──────────┐
│ Service Worker   │           │                        │───────────│ Claude   │
│ Offline Queue    │           │ Middleware (Auth)      │           │ API      │
└─────────────────┘            └──────────────────────┘           └──────────┘
```

### Client/Server Boundary
- **Server Components**: Layout, page shells, initial data fetch
- **Client Components**: Quick Capture input, card interactions, modals, filters, offline queue
- **API Routes**: All mutations, AI classification, image upload (server-side only for API keys)

---

## 3. Database Schema

### 3.1 entries table
```sql
CREATE TYPE entry_category AS ENUM ('task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox');
CREATE TYPE entry_input_type AS ENUM ('text', 'image', 'mixed');
CREATE TYPE entry_priority AS ENUM ('high', 'medium', 'low');

CREATE TABLE entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text            TEXT,
  image_url           TEXT,
  image_thumbnail_url TEXT,
  extracted_text      TEXT,
  category            entry_category NOT NULL DEFAULT 'inbox',
  tags                TEXT[] DEFAULT '{}',
  topic               TEXT,
  summary             TEXT,
  due_date            TIMESTAMPTZ,
  priority            entry_priority,
  is_completed        BOOLEAN DEFAULT FALSE,
  input_type          entry_input_type NOT NULL DEFAULT 'text',
  ai_metadata         JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_category ON entries(user_id, category);
CREATE INDEX idx_entries_topic ON entries(user_id, topic) WHERE topic IS NOT NULL;
CREATE INDEX idx_entries_created_at ON entries(user_id, created_at DESC);
CREATE INDEX idx_entries_tags ON entries USING GIN(tags);

-- Full-text search
ALTER TABLE entries ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(raw_text, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(extracted_text, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'C')
  ) STORED;
CREATE INDEX idx_entries_fts ON entries USING GIN(fts);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY entries_select ON entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY entries_insert ON entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY entries_update ON entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY entries_delete ON entries FOR DELETE USING (auth.uid() = user_id);
```

### 3.2 custom_categories table
```sql
CREATE TABLE custom_categories (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  icon     TEXT DEFAULT '📁',
  color    TEXT DEFAULT '#888888',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY cc_select ON custom_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cc_insert ON custom_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cc_update ON custom_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cc_delete ON custom_categories FOR DELETE USING (auth.uid() = user_id);
```

---

## 4. Supabase Storage Setup

- **Bucket**: `entry-images` (public read)
- **File path**: `{user_id}/{timestamp}_{filename}`
- **Max size**: 5MB
- **Allowed types**: image/jpeg, image/png, image/webp
- **RLS**: Upload = authenticated users only, Read = public

---

## 5. API Route Design

### POST /api/entries
- Input: `{ raw_text?: string, image?: File }` (multipart or JSON)
- Flow: Validate → Save entry (inbox) → Upload image if present → Trigger classify → Return entry
- Response: `{ entry: Entry, classifying: boolean }`

### GET /api/entries
- Query: `?category=&tag=&q=&page=&limit=20`
- Full-text search uses `fts` column with `plainto_tsquery('simple', q)`
- Response: `{ entries: Entry[], total: number, page: number }`

### PATCH /api/entries/:id
- Input: Partial entry fields
- Response: `{ entry: Entry }`

### DELETE /api/entries/:id
- Hard delete + remove image from storage
- Response: `{ success: true }`

### POST /api/classify
- Input: `{ entry_id: string, raw_text?: string, image_url?: string }`
- Flow: Build prompt → Call Claude Haiku (text) or Vision (image) → Parse JSON → Update entry
- Timeout: 8s (within Vercel 10s limit)
- Fallback: On failure, keep category as 'inbox'
- Response: `{ category, tags, topic?, summary?, extracted_text? }`

### POST /api/upload
- Input: FormData with image file
- Flow: Validate type/size → sharp resize (max 1920px) → Generate thumbnail (400px) → Upload both to Supabase Storage
- Response: `{ image_url, image_thumbnail_url }`

### GET /api/tags
- Response: `{ tags: { name: string, count: number }[] }`

### GET /api/topics
- Response: `{ topics: { name: string, count: number, latest: string }[] }`

### GET /api/topics/:topic
- Response: `{ entries: Entry[] }`

---

## 6. AI Classification Pipeline

### System Prompt
```
사용자가 입력한 텍스트 또는 이미지를 분석하여 JSON으로 분류하세요.
이미지가 포함된 경우 이미지 내용을 읽고 extracted_text에 추출한 텍스트를 포함하세요.

반환 형식 (JSON만 반환, 다른 텍스트 없이):
{
  "category": "task" | "idea" | "memo" | "knowledge" | "schedule" | "inbox",
  "tags": ["태그1", "태그2"],
  "topic": "주제명 (knowledge 카테고리인 경우만)",
  "extracted_text": "이미지에서 추출한 텍스트 (이미지인 경우만)",
  "summary": "한 줄 요약",
  "due_date": "ISO8601 (schedule인 경우만)",
  "priority": "high" | "medium" | "low" | null,
  "related_topics": ["관련 주제1"]
}
```

### Flow
1. Entry saved with `category: 'inbox'`
2. Background: POST /api/classify with entry_id
3. Claude API call (text: messages API, image: vision with base64)
4. Parse JSON response, validate schema
5. Update entry with classification result
6. If knowledge category: normalize topic, check for existing similar topics

### Fallback
- JSON parse failure → retry once → fallback to inbox
- API timeout → save as inbox, flag for retry
- Rate limit (429) → exponential backoff, max 2 retries

---

## 7. State Management (Zustand)

### useEntryStore
```typescript
interface EntryStore {
  entries: Entry[];
  total: number;
  filter: { category?: string; tag?: string; query?: string };
  loading: boolean;
  fetchEntries: (filter?) => Promise<void>;
  createEntry: (data) => Promise<Entry>;
  updateEntry: (id, data) => Promise<void>;
  deleteEntry: (id) => Promise<void>;
  toggleComplete: (id) => Promise<void>;
}
```

### useAuthStore
```typescript
interface AuthStore {
  user: User | null;
  loading: boolean;
  signIn: (email, password) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

### useOfflineStore
```typescript
interface OfflineStore {
  queue: OfflineEntry[];
  isOnline: boolean;
  addToQueue: (entry) => void;
  syncQueue: () => Promise<void>;
}
```

---

## 8. Component Tree

```
app/
├── layout.tsx                    # Root layout (providers, PWA meta)
├── (auth)/
│   └── login/page.tsx           # Login page
├── (main)/
│   ├── layout.tsx               # Auth-protected layout + navigation
│   ├── page.tsx                 # Dashboard (Quick Capture + Entry List)
│   ├── entry/[id]/page.tsx      # Entry detail
│   ├── knowledge/
│   │   ├── page.tsx             # Topic list
│   │   └── [topic]/page.tsx     # Topic detail
│   └── settings/page.tsx        # Settings
└── api/
    ├── entries/route.ts         # POST, GET
    ├── entries/[id]/route.ts    # PATCH, DELETE
    ├── classify/route.ts        # POST
    ├── upload/route.ts          # POST
    ├── tags/route.ts            # GET
    └── topics/
        ├── route.ts             # GET
        └── [topic]/route.ts     # GET

components/
├── capture/
│   ├── QuickCapture.tsx         # Main capture component
│   ├── TextInput.tsx            # Text input with Enter handling
│   └── ImageUpload.tsx          # Image attach/paste
├── cards/
│   ├── EntryCard.tsx            # Card with thumbnail
│   └── EntryCardSkeleton.tsx    # Loading skeleton
├── dashboard/
│   ├── CategoryTabs.tsx         # Category filter tabs
│   ├── TagFilter.tsx            # Tag filter
│   ├── SearchBar.tsx            # Full-text search
│   └── EntryList.tsx            # Paginated entry list
├── entry/
│   ├── EntryDetail.tsx          # Detail view
│   └── EntryEditModal.tsx       # Edit modal
├── knowledge/
│   ├── TopicList.tsx            # Topic list with counts
│   └── TopicEntries.tsx         # Entries for a topic
├── auth/
│   ├── LoginForm.tsx            # Email + password form
│   └── GoogleSignIn.tsx         # Google OAuth button
└── ui/                          # shadcn/ui components
```

---

## 9. Authentication Flow

1. Middleware checks Supabase session on all `(main)` routes
2. No session → redirect to `/login`
3. Login: email/password or Google OAuth via Supabase Auth
4. Session stored in cookies via `@supabase/ssr`
5. Client-side: `useAuthStore` syncs with Supabase `onAuthStateChange`

---

## 10. Image Processing Pipeline

1. Client: Validate type (jpeg/png/webp) + size (<5MB)
2. Client: Preview image immediately
3. Server `/api/upload`:
   - sharp: Resize to max 1920px width (maintain aspect ratio)
   - sharp: Generate 400px thumbnail
   - Upload both to Supabase Storage `entry-images/{user_id}/`
   - Return `{ image_url, image_thumbnail_url }`
4. For classification: Convert image to base64 for Claude Vision API

---

## 11. PWA Configuration

```javascript
// next.config.js with next-pwa
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    { urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/, handler: 'NetworkFirst' },
    { urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/, handler: 'CacheFirst' },
    { urlPattern: /\/_next\/.*/, handler: 'CacheFirst' },
  ],
});
```

### Offline Strategy
- Text entries: Save to IndexedDB via Zustand persist → sync when online
- Images: Queue upload, save entry text-only → upload image when online
- `navigator.onLine` + `online`/`offline` events for detection

---

## 12. Implementation Steps (8 Steps)

### Step 1: Project Init
- `npx create-next-app@latest braindump --typescript --tailwind --eslint --app --src-dir`
- Install: shadcn/ui, zustand, @supabase/supabase-js, @supabase/ssr, @anthropic-ai/sdk, next-pwa, zod, date-fns, sharp, lucide-react
- Configure shadcn/ui components
- Setup folder structure

### Step 2: DB Schema + Storage
- Create Supabase SQL migration with entries + custom_categories tables
- Setup RLS policies
- Create entry-images storage bucket
- Add FTS index

### Step 3: Authentication
- Supabase Auth client setup with @supabase/ssr
- Middleware for protected routes
- Login page with email + Google OAuth
- useAuthStore

### Step 4: Quick Capture UI
- QuickCapture component (auto-focus, Enter save)
- ImageUpload component (file picker + clipboard paste)
- /api/upload endpoint with sharp processing
- /api/entries POST endpoint
- Optimistic UI with skeleton cards

### Step 5: AI Classification
- /api/classify endpoint
- Claude Haiku integration for text
- Claude Vision integration for images
- JSON response parsing + validation
- Fallback to inbox on failure
- Background classification after entry save

### Step 6: Dashboard
- CategoryTabs component
- EntryList with card UI
- SearchBar with FTS
- TagFilter
- EntryDetail + EditModal
- Task completion toggle
- /api/entries GET with filtering

### Step 7: Knowledge System
- /knowledge page with TopicList
- /knowledge/:topic page with TopicEntries
- /api/topics endpoints
- Topic auto-assignment in classify
- Topic edit/merge UI

### Step 8: PWA
- next-pwa configuration
- manifest.json
- Service worker with Workbox
- Offline queue (IndexedDB)
- Online sync mechanism
- Install prompt

---

## 13. Performance Targets

| Metric | Target |
|--------|--------|
| Text save | < 2s |
| Image upload | < 5s |
| AI classify (text) | < 3s |
| AI classify (image) | < 5s |
| Lighthouse PWA | > 90 |

## 14. Constraints

- Claude API: ~$0.001-0.003/req (Haiku)
- Supabase Free: 1GB storage, 500MB DB
- Image limit: 5MB, jpeg/png/webp
- Vercel: 10s serverless timeout
- Korean-first UI
