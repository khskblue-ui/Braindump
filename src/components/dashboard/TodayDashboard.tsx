'use client';

import { useState, useMemo } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { hasCategory, CATEGORY_MAP } from '@/types';
import type { Entry } from '@/types';
import { format, isToday, isPast, startOfDay, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { ChevronDown, ChevronUp } from 'lucide-react';

type DashboardItem =
  | { kind: 'overdue'; entry: Entry }
  | { kind: 'today'; entry: Entry }
  | { kind: 'highpriority'; entry: Entry };

function getCategoryDotColor(entry: Entry): string {
  const cat = entry.categories?.[0];
  if (!cat) return '#9CA3AF';
  return CATEGORY_MAP[cat]?.color ?? '#9CA3AF';
}

function formatOverdueLabel(due_date: string): string {
  const d = new Date(due_date);
  return formatDistanceToNow(d, { locale: ko, addSuffix: true });
}

function formatDueTime(due_date: string): string {
  const d = new Date(due_date);
  // Only show time if it's not midnight (00:00)
  if (d.getHours() === 0 && d.getMinutes() === 0) return '';
  return format(d, 'HH:mm');
}

interface TodayDashboardProps {
  onEntryClick?: (entry: Entry) => void;
}

export function TodayDashboard({ onEntryClick }: TodayDashboardProps) {
  const entries = useEntryStore((s) => s.entries);
  const [expanded, setExpanded] = useState(false);

  const { overdue, todayItems, highPriority, totalCount } = useMemo(() => {
    const today = startOfDay(new Date());
    const overdue: Entry[] = [];
    const todayItems: Entry[] = [];
    const highPriority: Entry[] = [];

    for (const entry of entries) {
      // is_pinned check (future feature - field may not exist yet)
      const isPinned = (entry as Entry & { is_pinned?: boolean }).is_pinned === true;

      if (entry.due_date) {
        const dueDate = new Date(entry.due_date);
        const dueDateDay = startOfDay(dueDate);

        if (isToday(dueDate)) {
          if (hasCategory(entry, 'schedule') || hasCategory(entry, 'task')) {
            todayItems.push(entry);
          }
        } else if (isPast(dueDateDay) && !entry.is_completed && hasCategory(entry, 'task')) {
          overdue.push(entry);
        }
      } else {
        // No due_date: high priority task
        if (
          entry.priority === 'high' &&
          hasCategory(entry, 'task') &&
          !entry.is_completed
        ) {
          highPriority.push(entry);
        }
      }

      // Pinned entries always appear (if not already added)
      if (isPinned) {
        const alreadyAdded =
          overdue.includes(entry) ||
          todayItems.includes(entry) ||
          highPriority.includes(entry);
        if (!alreadyAdded) {
          todayItems.push(entry);
        }
      }
    }

    // Sort today items by due_date time ascending
    todayItems.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    return { overdue, todayItems, highPriority, totalCount: overdue.length + todayItems.length + highPriority.length };
  }, [entries]);

  if (totalCount === 0) return null;

  const headerDate = format(new Date(), 'M월 d일 EEEE', { locale: ko });

  return (
    <div className="rounded-lg border bg-card/50 text-card-foreground shadow-sm">
      {/* Header */}
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{headerDate}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {totalCount}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="divide-y divide-border/50 border-t border-border/50">
          {/* Overdue items */}
          {overdue.map((entry) => (
            <div
              key={`overdue-${entry.id}`}
              className={`flex items-center gap-2 px-4 py-2${onEntryClick ? ' cursor-pointer hover:bg-muted/50' : ''}`}
              onClick={() => onEntryClick?.(entry)}
              role={onEntryClick ? 'button' : undefined}
              tabIndex={onEntryClick ? 0 : undefined}
              onKeyDown={onEntryClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onEntryClick(entry); } : undefined}
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: getCategoryDotColor(entry) }}
              />
              <span className="flex-1 truncate text-sm text-foreground">
                {entry.summary ?? entry.raw_text ?? ''}
              </span>
              <span className="flex items-center gap-1 text-xs text-destructive">
                <span>⚠</span>
                <span>{formatOverdueLabel(entry.due_date!)}</span>
              </span>
            </div>
          ))}

          {/* Today items */}
          {todayItems.map((entry) => {
            const timeStr = entry.due_date ? formatDueTime(entry.due_date) : '';
            return (
              <div
                key={`today-${entry.id}`}
                className={`flex items-center gap-2 px-4 py-2${onEntryClick ? ' cursor-pointer hover:bg-muted/50' : ''}`}
                onClick={() => onEntryClick?.(entry)}
                role={onEntryClick ? 'button' : undefined}
                tabIndex={onEntryClick ? 0 : undefined}
                onKeyDown={onEntryClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onEntryClick(entry); } : undefined}
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: getCategoryDotColor(entry) }}
                />
                <span className="flex-1 truncate text-sm text-foreground">
                  {entry.summary ?? entry.raw_text ?? ''}
                </span>
                {timeStr && (
                  <span className="text-xs text-muted-foreground">{timeStr}</span>
                )}
              </div>
            );
          })}

          {/* High priority tasks without due_date */}
          {highPriority.map((entry) => (
            <div
              key={`hp-${entry.id}`}
              className={`flex items-center gap-2 px-4 py-2${onEntryClick ? ' cursor-pointer hover:bg-muted/50' : ''}`}
              onClick={() => onEntryClick?.(entry)}
              role={onEntryClick ? 'button' : undefined}
              tabIndex={onEntryClick ? 0 : undefined}
              onKeyDown={onEntryClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onEntryClick(entry); } : undefined}
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: getCategoryDotColor(entry) }}
              />
              <span className="flex-1 truncate text-sm text-foreground">
                {entry.summary ?? entry.raw_text ?? ''}
              </span>
              <span className="text-xs font-medium text-orange-500">높은 우선순위</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
