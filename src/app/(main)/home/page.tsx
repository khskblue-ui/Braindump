'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useEntryStore } from '@/stores/entry-store';
import { QuickCapture } from '@/components/capture/QuickCapture';
import { EntryCard } from '@/components/cards/EntryCard';
import { EntryCardSkeleton } from '@/components/cards/EntryCardSkeleton';
import { CategoryTabs } from '@/components/dashboard/CategoryTabs';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { ReminderCheck } from '@/components/dashboard/ReminderCheck';
import { TodayDashboard } from '@/components/dashboard/TodayDashboard';
import { VisitReview } from '@/components/dashboard/VisitReview';
import { PwaInstallPrompt } from '@/components/dashboard/PwaInstallPrompt';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { hasCategory } from '@/types';
import type { Entry } from '@/types';

// Lazy load heavy modal components (performance: reduce initial bundle)
const EntryEditModal = dynamic(
  () => import('@/components/entry/EntryEditModal').then((m) => ({ default: m.EntryEditModal })),
  { ssr: false }
);
const EntryViewerModal = dynamic(
  () => import('@/components/entry/EntryViewerModal').then((m) => ({ default: m.EntryViewerModal })),
  { ssr: false }
);

export default function DashboardPage() {
  const entries = useEntryStore((s) => s.entries);
  const loading = useEntryStore((s) => s.loading);
  const fetchEntries = useEntryStore((s) => s.fetchEntries);
  const hasMore = useEntryStore((s) => s.hasMore);
  const loadMore = useEntryStore((s) => s.loadMore);
  const hydrated = useEntryStore((s) => s._hydrated);
  const sortMode = useEntryStore((s) => s.sortMode);
  const setSortMode = useEntryStore((s) => s.setSortMode);
  const moveEntry = useEntryStore((s) => s.moveEntry);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('edit');
  const [reclassifying, setReclassifying] = useState(false);

  const openEntry = useCallback((entry: Entry) => {
    if (sortMode) return;
    setSelectedEntry(entry);
    const hasLongContent = entry.input_type === 'pdf' || (entry.extracted_text && entry.extracted_text.length > 200);
    setModalMode(hasLongContent ? 'view' : 'edit');
  }, [sortMode]);

  const filter = useEntryStore((s) => s.filter);
  // M3: useMemo to avoid recalculating on every render
  const inboxCount = useMemo(
    () => entries.filter((e) => hasCategory(e, 'inbox')).length,
    [entries]
  );

  const showSortButton = !!(filter.category && (filter.category as string) !== 'all' && filter.category !== 'schedule' && !filter.query);

  const handleReclassify = async () => {
    setReclassifying(true);
    try {
      const res = await fetch('/api/classify', { method: 'PATCH' });
      const data = await res.json();
      if (data.reclassified > 0) {
        toast.success(`${data.reclassified}개 항목이 재분류되었습니다.`);
        fetchEntries();
      } else {
        toast.info('재분류할 미분류 항목이 없습니다.');
      }
    } catch {
      toast.error('재분류에 실패했습니다.');
    } finally {
      setReclassifying(false);
    }
  };

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // M7: Empty deps - fetchEntries reference is stable from Zustand
  useEffect(() => {
    fetchEntries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exit sort mode when category changes
  useEffect(() => {
    setSortMode(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.category]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return (
    <div className="space-y-4">
      {/* Onboarding Modal — shown only on first visit */}
      <OnboardingModal />

      {/* Quick Capture */}
      <QuickCapture />

      {/* Visit Review */}
      <VisitReview />

      {/* Today Dashboard */}
      <TodayDashboard onEntryClick={openEntry} />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <CategoryTabs />
          </div>
          {filter.category === 'inbox' && inboxCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReclassify}
              disabled={reclassifying}
              className="flex-shrink-0 text-xs gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              {reclassifying ? '분류 중...' : `미분류 ${inboxCount}개 재분류`}
            </Button>
          )}
          {showSortButton && (
            <button
              onClick={() => setSortMode(!sortMode)}
              className={`flex-shrink-0 text-xs px-2 py-1 rounded border transition-colors ${
                sortMode
                  ? 'border-blue-400 text-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {sortMode ? '완료' : '정렬'}
            </button>
          )}
        </div>
        <SearchBar />
      </div>

      {/* Entry List */}
      <div className="space-y-2">
        {!hydrated || (loading && entries.length === 0) ? (
          Array.from({ length: 3 }).map((_, i) => (
            <EntryCardSkeleton key={i} />
          ))
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">아직 기록이 없습니다</p>
            <p className="text-sm mt-1">위 입력창에 생각을 입력해보세요!</p>
          </div>
        ) : (
          <>
            {entries.map((entry, idx) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={openEntry}
                sortMode={sortMode}
                onMoveUp={idx > 0 ? () => moveEntry(entry.id, 'up') : undefined}
                onMoveDown={idx < entries.length - 1 ? () => moveEntry(entry.id, 'down') : undefined}
                isFirst={idx === 0}
                isLast={idx === entries.length - 1}
              />
            ))}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
                  {loading ? '로딩 중...' : '더 보기'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Viewer Modal for PDF/long content */}
      {selectedEntry && modalMode === 'view' && (
        <EntryViewerModal
          entry={selectedEntry}
          open
          onClose={() => setSelectedEntry(null)}
          onEdit={() => setModalMode('edit')}
        />
      )}

      {/* Edit Modal */}
      {selectedEntry && modalMode === 'edit' && (
        <EntryEditModal
          entry={selectedEntry}
          open
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {/* PWA Install Prompt — one-time, shown after content */}
      <PwaInstallPrompt />

      <ReminderCheck />
    </div>
  );
}
