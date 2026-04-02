'use client';

import { create } from 'zustand';
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

  setFilter: (filter: EntryFilter) => void;
  setPage: (page: number) => void;
  fetchEntries: () => Promise<void>;
  createEntry: (data: CreateEntryInput) => Promise<Entry>;
  updateEntry: (id: string, data: UpdateEntryInput) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  classifyEntry: (id: string) => Promise<void>;
}

export const useEntryStore = create<EntryStore>((set, get) => ({
  entries: [],
  total: 0,
  filter: {},
  loading: false,
  page: 1,

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
    await get().updateEntry(id, { is_completed: !entry.is_completed });
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
}));
