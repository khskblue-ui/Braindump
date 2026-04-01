# BrainDump Implementation Plan

## Step 1: Project Init (독립 실행)
1. `npx create-next-app@latest` with TypeScript + Tailwind + App Router + src-dir
2. Install core deps: zustand, @supabase/supabase-js, @supabase/ssr, @anthropic-ai/sdk, zod, date-fns, sharp, lucide-react
3. Setup shadcn/ui (init + button, input, card, dialog, tabs, badge, toast, skeleton, dropdown-menu, avatar)
4. Create folder structure: components/{capture,cards,dashboard,entry,knowledge,auth,ui}, lib/, stores/, types/
5. Configure .env.local template
6. Setup TypeScript types (Entry, Category, etc.)
7. Configure next.config with image domains

## Step 2: DB Schema + Supabase Setup (Step 1 이후)
1. Create SQL migration file with entries table + enums + indexes + FTS
2. Create custom_categories table
3. Create RLS policies for both tables
4. Create updated_at trigger
5. Create entry-images storage bucket config
6. Create Supabase client utilities (lib/supabase/client.ts, server.ts, middleware.ts)

## Step 3: Authentication (Step 2 이후)
1. Create Supabase Auth middleware for protected routes
2. Create /login page with LoginForm component
3. Implement email/password sign up + sign in
4. Implement Google OAuth sign in button
5. Create useAuthStore (Zustand)
6. Create (main)/layout.tsx with auth check
7. Create (auth)/layout.tsx for public routes

## Step 4: Quick Capture UI (Step 3 이후)
1. Create QuickCapture component (auto-focus, Enter to save, Shift+Enter newline)
2. Create ImageUpload component (file picker + Ctrl+V paste)
3. Create /api/upload route (sharp resize + thumbnail + Supabase Storage)
4. Create /api/entries POST route
5. Create EntryCard + EntryCardSkeleton components
6. Create useEntryStore (Zustand)
7. Wire up dashboard page with Quick Capture + Entry List

## Step 5: AI Classification (Step 4 이후)
1. Create /api/classify route with Claude Haiku integration
2. Implement text classification (messages API)
3. Implement image classification (Vision API with base64)
4. JSON response parsing + zod validation
5. Fallback logic (inbox on failure)
6. Hook into entry creation flow (background classify after save)
7. Update EntryCard to show classification results

## Step 6: Dashboard (Step 5 이후)
1. Create CategoryTabs component (7 tabs)
2. Create SearchBar with FTS query
3. Create TagFilter component
4. Create /api/entries GET with filtering + pagination
5. Create /api/tags GET endpoint
6. Create EntryDetail component
7. Create EntryEditModal with category/tag/topic editing
8. Create task completion toggle

## Step 7: Knowledge System (Step 6 이후)
1. Create /api/topics GET endpoint
2. Create /api/topics/[topic] GET endpoint
3. Create /knowledge page with TopicList
4. Create /knowledge/[topic] page with TopicEntries
5. Add topic normalization in classify
6. Add topic edit/merge functionality

## Step 8: PWA (Step 7 이후)
1. Install next-pwa + workbox-webpack-plugin
2. Configure next-pwa in next.config
3. Create manifest.json (theme #1A73E8, standalone)
4. Create useOfflineStore with IndexedDB persistence
5. Implement offline text save queue
6. Implement online sync mechanism
7. Add install prompt UI
8. Test Lighthouse PWA score

## Execution Strategy
- Steps are sequential (each depends on previous)
- Within each step, independent files can be created in parallel
- AI classification (Step 5) is the critical integration point
- PWA (Step 8) is the final layer on top of working app
