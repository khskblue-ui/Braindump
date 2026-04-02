'use client';

import { useEffect } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { toast } from 'sonner';

export function ReminderCheck() {
  const entries = useEntryStore((s) => s.entries);

  useEffect(() => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const upcoming = entries.filter(
      (e) =>
        e.category === 'schedule' &&
        e.due_date &&
        !e.is_completed &&
        new Date(e.due_date) > now &&
        new Date(e.due_date) <= oneHourLater
    );

    upcoming.forEach((e) => {
      toast.info(`⏰ 곧 다가오는 일정: ${e.summary || e.raw_text}`, {
        duration: 10000,
      });
    });

    const interval = setInterval(() => {
      const now = new Date();
      const fiveMinLater = new Date(now.getTime() + 5 * 60 * 1000);

      const imminent = useEntryStore.getState().entries.filter(
        (e) =>
          e.category === 'schedule' &&
          e.due_date &&
          !e.is_completed &&
          new Date(e.due_date) > now &&
          new Date(e.due_date) <= fiveMinLater
      );

      imminent.forEach((e) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('BrainDump 리마인드', {
            body: e.summary || e.raw_text || '일정이 곧 시작됩니다',
            icon: '/icons/icon-192x192.png',
          });
        }
        toast.warning(`⏰ ${e.summary || e.raw_text}`, { duration: 15000 });
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [entries]);

  return null;
}
