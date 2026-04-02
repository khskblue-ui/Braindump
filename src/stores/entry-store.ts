'use client';

import { create } from 'zustand';
import { toast } from 'sonner';
import type { Entry, EntryCategory, CreateEntryInput, UpdateEntryInput } from '@/types';

interface EntryFilter {
  category?: EntryCategory;
  tag?: string;
  query?: string;
}

interface EntryStore {
  entries: Entry[];
  total: number;
  filter: EntryFilter;
  loading: boolean;
  page: number;
  trashEntries: Entry[];

  setFilter: (filter: EntryFilter) => void;
  setPage: (page: number) => void;
  fetchEntries: () => Promise<void>;
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

export const useEntryStore = create<EntryStore>((set, get) => ({
  entries: [],
  total: 0,
  filter: {},
  loading: false,
  page: 1,
  trashEntries: [],

  setFilter: (filter) => {
    set({ filter, page: 1 });
    get().fetchEntries();
  },

  setPage: (page) => {
    set({ page });
    get().fetchEntries();
  },

  fetchEntries: async () => {
    set({ loading: true });
    try {
      const { filter, page } = get();
      const params = new URLSearchParams();
      if (filter.category) params.set('category', filter.category);
      if (filter.tag) params.set('tag', filter.tag);
      if (filter.query) params.set('q', filter.query);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await fetch(`/api/entries?${params}`);
      if (!res.ok) throw new Error('Failed to fetch entries');
      const data = await res.json();
      set({ entries: data.entries, total: data.total });
    } finally {
      set({ loading: false });
    }
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
      total: state.total + 1,
    }));

    // Background classification
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
      total: state.total - 1,
    }));
  },

  toggleComplete: async (id) => {
    const entry = get().entries.find((e) => e.id === id);
    if (!entry) return;

    if (!entry.is_completed) {
      // Completing a task: soft delete + undo toast
      await get().updateEntry(id, { is_completed: true, deleted_at: new Date().toISOString() });
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
        total: state.total - 1,
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
                category: result.category ?? e.category,
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
      // Classification failure is non-blocking
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
      total: state.total - 1,
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
}));
