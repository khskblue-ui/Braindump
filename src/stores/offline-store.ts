'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreateEntryInput } from '@/types';

interface OfflineEntry extends CreateEntryInput {
  id: string;
  created_at: string;
}

interface OfflineStore {
  queue: OfflineEntry[];
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  addToQueue: (entry: CreateEntryInput) => void;
  syncQueue: () => Promise<void>;
  removeFromQueue: (id: string) => void;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

      setOnline: (online) => {
        set({ isOnline: online });
        if (online && get().queue.length > 0) {
          get().syncQueue();
        }
      },

      addToQueue: (entry) => {
        const offlineEntry: OfflineEntry = {
          ...entry,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        };
        set((state) => ({ queue: [...state.queue, offlineEntry] }));
      },

      syncQueue: async () => {
        const { queue } = get();
        if (queue.length === 0) return;

        const synced: string[] = [];

        for (const entry of queue) {
          try {
            const res = await fetch('/api/entries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                raw_text: entry.raw_text,
                input_type: entry.input_type,
              }),
            });
            if (res.ok) synced.push(entry.id);
          } catch {
            break; // Stop syncing if network fails
          }
        }

        set((state) => ({
          queue: state.queue.filter((e) => !synced.includes(e.id)),
        }));
      },

      removeFromQueue: (id) => {
        set((state) => ({ queue: state.queue.filter((e) => e.id !== id) }));
      },
    }),
    {
      name: 'braindump-offline-queue',
    }
  )
);
