'use client';

import { useEffect, useMemo, useState } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { hasCategory } from '@/types';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LS_KEY = 'braindump-last-seen';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

interface ReviewSummary {
  completedTasks: number;
  newIdeas: number;
  upcomingSchedules: number;
  incompleteTasks: number;
  since: Date;
}

export function VisitReview() {
  const entries = useEntryStore((s) => s.entries);
  const hydrated = useEntryStore((s) => s._hydrated);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);

  // Memoize expensive filtering to avoid re-computing on every render
  const computedSummary = useMemo(() => {
    if (!hydrated) return null;

    const raw = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
    const lastSeen = raw ? new Date(raw) : null;
    const now = new Date();

    if (lastSeen && now.getTime() - lastSeen.getTime() < TWENTY_FOUR_HOURS) {
      return null;
    }

    const since = lastSeen ?? new Date(0);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const completedTasks = entries.filter(
      (e) => hasCategory(e, 'task') && e.is_completed && new Date(e.updated_at) >= since
    ).length;

    const newIdeas = entries.filter(
      (e) => hasCategory(e, 'idea') && new Date(e.created_at) >= since
    ).length;

    const upcomingSchedules = entries.filter(
      (e) =>
        hasCategory(e, 'schedule') &&
        e.due_date &&
        new Date(e.due_date) >= now &&
        new Date(e.due_date) <= next7Days
    ).length;

    const incompleteTasks = entries.filter(
      (e) => hasCategory(e, 'task') && !e.is_completed && !e.deleted_at
    ).length;

    return { completedTasks, newIdeas, upcomingSchedules, incompleteTasks, since };
  }, [hydrated, entries]);

  useEffect(() => {
    if (computedSummary !== null) {
      setSummary(computedSummary);
    }
  }, [computedSummary]);

  const handleDismiss = () => {
    localStorage.setItem(LS_KEY, new Date().toISOString());
    setSummary(null);
  };

  if (!summary) return null;

  const isFirstVisit = summary.since.getTime() === 0;

  return (
    <div className="relative rounded-xl px-4 py-3 bg-gradient-to-r from-blue-50 via-purple-50/60 to-pink-50 border border-border/50">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="닫기"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <p className="text-xs font-semibold text-foreground mb-1.5">
        {isFirstVisit ? '환영합니다!' : '다시 오셨군요!'}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
        {summary.completedTasks > 0 && (
          <span>완료한 할 일 <span className="font-medium text-green-600">{summary.completedTasks}개</span></span>
        )}
        {summary.newIdeas > 0 && (
          <span>새 아이디어 <span className="font-medium text-yellow-600">{summary.newIdeas}개</span></span>
        )}
        {summary.upcomingSchedules > 0 && (
          <span>다가오는 일정 <span className="font-medium text-orange-600">{summary.upcomingSchedules}개</span></span>
        )}
        {summary.incompleteTasks > 0 && (
          <span>미완료 할 일 <span className="font-medium text-blue-600">{summary.incompleteTasks}개</span></span>
        )}
        {summary.completedTasks === 0 && summary.newIdeas === 0 && summary.upcomingSchedules === 0 && summary.incompleteTasks === 0 && (
          <span>오늘도 기록을 시작해보세요!</span>
        )}
      </div>

      <div className="mt-2 flex justify-end">
        <Button size="sm" variant="ghost" className="text-xs h-6 px-2" onClick={handleDismiss}>
          확인
        </Button>
      </div>
    </div>
  );
}
