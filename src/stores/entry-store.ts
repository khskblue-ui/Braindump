'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type { Entry, EntryCategory, CreateEntryInput, UpdateEntryInput } from '@/types';

interface EntryFilter {
  category?: EntryCategory;
  tag?: string;
  query?: string;
}

interface EntryStore {
  entries: Entry[];
  hasMore: boolean;
  filter: EntryFilter;
  loading: boolean;
  page: number;
  trashEntries: Entry[];
  _hydrated: boolean;

  setFilter: (filter: EntryFilter) => void;
  setPage: (page: number) => void;
  fetchEntries: () => Promise<void>;
  loadMore: () => void;
  createEntry: (data: CreateEntryInput) => Promise<Entry>;
  updateEntry: (id: string, data: UpdateEntryInput) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  classifyEntry: (id: string) => Promise<void>;
  softDelete: (id: string) => Promise<void>;
  restoreEntry: (id: string) => Promise<void>;
  fetchTrash: () => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
}

// AbortController for cancelling stale fetch requests (M1)
let fetchController: AbortController | null = null;

export const useEntryStore = create<EntryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      hasMore: false,
      filter: {},
      loading: false,
      page: 1,
      trashEntries: [],
      _hydrated: false,

      setFilter: (filter) => {
        set({ filter, page: 1 });
        get().fetchEntries();
      },

      setPage: (page) => {
        set({ page });
        get().fetchEntries();
      },

      fetchEntries: async () => {
        // Cancel any in-flight request (M1: race condition fix)
        if (fetchController) fetchController.abort();
        fetchController = new AbortController();
        const { signal } = fetchController;

        set({ loading: true });
        try {
          const { filter, page } = get();
          const params = new URLSearchParams();
          if (filter.category) params.set('category', filter.category);
          if (filter.tag) params.set('tag', filter.tag);
          if (filter.query) params.set('q', filter.query);
          params.set('page', String(page));
          params.set('limit', '20');

          const res = await fetch(`/api/entries?${params}`, { signal });
          if (!res.ok) throw new Error('Failed to fetch entries');
          const data = await res.json();
          if (page === 1) {
            set({ entries: data.entries, hasMore: data.hasMore });
          } else {
            set((state) => ({
              entries: [...state.entries, ...data.entries],
              hasMore: data.hasMore,
            }));
          }
        } catch (err: unknown) {
          // Ignore abort errors
          if (err instanceof DOMException && err.name === 'AbortError') return;
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      loadMore: () => {
        const { hasMore, loading } = get();
        if (!hasMore || loading) return;
        set((state) => ({ page: state.page + 1 }));
        get().fetchEntries();
      },

      createEntry: async (data) => {
        const res = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || err.error || `Failed to create entry (${res.status})`);
        }
        const { entry } = await res.json();

        set((state) => ({
          entries: [entry, ...state.entries],
        }));

        // Background classification (M2: toast on failure)
        get().classifyEntry(entry.id);

        return entry;
      },

      updateEntry: async (id, data) => {
        const res = await fetch(`/api/entries/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update entry');
        const { entry } = await res.json();

        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? entry : e)),
        }));
      },

      deleteEntry: async (id) => {
        const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete entry');

        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      toggleComplete: async (id) => {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return;

        if (!entry.is_completed) {
          // Optimistic: immediately show check mark
          set((state) => ({
            entries: state.entries.map((e) =>
              e.id === id ? { ...e, is_completed: true } : e
            ),
          }));

          // Then persist + remove from list after short delay
          try {
            await get().updateEntry(id, { is_completed: true, deleted_at: new Date().toISOString() });
            set((state) => ({
              entries: state.entries.filter((e) => e.id !== id),
            }));
            toast('할 일을 완료했습니다.', {
              action: {
                label: '되돌리기',
                onClick: async () => {
                  await get().updateEntry(id, { is_completed: false, deleted_at: null });
                  get().fetchEntries();
                },
              },
              duration: 5000,
            });
          } catch {
            // Rollback on failure
            set((state) => ({
              entries: state.entries.map((e) =>
                e.id === id ? { ...e, is_completed: false } : e
              ),
            }));
          }
        } else {
          // Uncompleting: just toggle
          await get().updateEntry(id, { is_completed: false });
        }
      },

      classifyEntry: async (id) => {
        try {
          const res = await fetch('/api/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entry_id: id }),
          });
          if (!res.ok) return;
          const result = await res.json();

          set((state) => ({
            entries: state.entries.map((e) =>
              e.id === id
                ? {
                    ...e,
                    categories: result.categories ?? e.categories,
                    tags: result.tags ?? e.tags,
                    topic: result.topic ?? e.topic,
                    summary: result.summary ?? e.summary,
                    extracted_text: result.extracted_text ?? e.extracted_text,
                    due_date: result.due_date ?? e.due_date,
                    priority: result.priority ?? e.priority,
                  }
                : e
            ),
          }));
        } catch {
          toast.error('AI 분류에 실패했습니다. 수동으로 분류해주세요.');
        }
      },

      softDelete: async (id) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          toast.error('오프라인 상태에서는 삭제할 수 없습니다.');
          return;
        }
        await get().updateEntry(id, { deleted_at: new Date().toISOString() });
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      restoreEntry: async (id) => {
        const res = await fetch(`/api/trash/${id}`, { method: 'PATCH' });
        if (!res.ok) throw new Error('Failed to restore entry');
        set((state) => ({
          trashEntries: state.trashEntries.filter((e) => e.id !== id),
        }));
      },

      fetchTrash: async () => {
        try {
          const res = await fetch('/api/trash');
          if (!res.ok) throw new Error('Failed to fetch trash');
          const data = await res.json();
          set({ trashEntries: data.entries });
        } catch {
          // Non-blocking
        }
      },

      permanentDelete: async (id) => {
        const res = await fetch(`/api/trash/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to permanently delete entry');
        set((state) => ({
          trashEntries: state.trashEntries.filter((e) => e.id !== id),
        }));
      },

      emptyTrash: async () => {
        const res = await fetch('/api/trash/purge', { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to empty trash');
        set({ trashEntries: [] });
      },
    }),
    {
      name: 'braindump-entries',
      partialize: (state) => ({
        entries: state.entries.slice(0, 50).map(e => ({
          ...e,
          // Strip all signed URLs (they expire) - not just token= ones (L1)
          image_url: e.image_url && (e.image_url.includes('token=') || e.image_url.includes('Expires=')) ? null : e.image_url,
          image_thumbnail_url: e.image_thumbnail_url && (e.image_thumbnail_url.includes('token=') || e.image_thumbnail_url.includes('Expires=')) ? null : e.image_thumbnail_url,
        })),
      }),
      onRehydrateStorage: () => (state) => {
        // C2: Mark hydration complete and trigger background refresh
        if (state) {
          // Migrate cached entries from old category (string) → categories (array)
          state.entries = state.entries.map((e) => {
            const raw = e as unknown as Record<string, unknown>;
            if (!raw.categories && raw.category) {
              return { ...e, categories: [raw.category as string] } as Entry;
            }
            if (!raw.categories) {
              return { ...e, categories: ['inbox'] } as Entry;
            }
            return e;
          });
          state._hydrated = true;
        }
      },
    }
  )
);
