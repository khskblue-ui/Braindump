'use client';

import { useEffect, useRef } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { toast } from 'sonner';

export function ReminderCheck() {
  const entries = useEntryStore((s) => s.entries);
  // H3: Track notified entry IDs to prevent duplicate notifications
  const notifiedRef = useRef(new Set<string>());

  useEffect(() => {
    const checkUpcoming = () => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      const currentEntries = useEntryStore.getState().entries;
      const upcoming = currentEntries.filter(
        (e) =>
          e.category === 'schedule' &&
          e.due_date &&
          !e.is_completed &&
          new Date(e.due_date) > now &&
          new Date(e.due_date) <= oneHourLater &&
          !notifiedRef.current.has(e.id)
      );

      upcoming.forEach((e) => {
        notifiedRef.current.add(e.id);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('BrainDump 리마인드', {
            body: e.summary || e.raw_text || '일정이 곧 시작됩니다',
            icon: '/icons/icon-192x192.png',
          });
        }
        toast.info(`⏰ 곧 다가오는 일정: ${e.summary || e.raw_text}`, {
          duration: 10000,
        });
      });
    };

    // Check on mount
    checkUpcoming();

    // Check every 5 minutes
    const interval = setInterval(checkUpcoming, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []); // Stable: reads from store directly, no dependency on entries

  return null;
}
