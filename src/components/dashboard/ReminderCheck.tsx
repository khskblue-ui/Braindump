'use client';

import { useEffect, useRef } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { REMINDER_OPTIONS } from '@/types';
import type { ReminderOption } from '@/types';
import { toast } from 'sonner';

export function ReminderCheck() {
  // Track notified: "entryId:reminderOption"
  const notifiedRef = useRef(new Set<string>());

  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      const entries = useEntryStore.getState().entries;

      entries.forEach((entry) => {
        if (!entry.due_date || !entry.reminders?.length || entry.is_completed) return;
        if (entry.category !== 'task' && entry.category !== 'schedule') return;

        const dueTime = new Date(entry.due_date).getTime();
        if (dueTime < now) return; // past due

        entry.reminders.forEach((reminder: ReminderOption) => {
          const key = `${entry.id}:${reminder}`;
          if (notifiedRef.current.has(key)) return;

          const opt = REMINDER_OPTIONS.find(o => o.value === reminder);
          if (!opt) return;

          const triggerTime = dueTime - opt.ms;
          if (now >= triggerTime && now < dueTime) {
            notifiedRef.current.add(key);

            const title = entry.summary || entry.raw_text || '일정 알림';
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('BrainDump 리마인드', {
                body: `${opt.label}: ${title}`,
                icon: '/icons/icon-192x192.png',
              });
            }
            toast.info(`⏰ ${opt.label}: ${title}`, { duration: 10000 });
          }
        });
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, []);

  return null;
}
