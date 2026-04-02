'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useEntryStore } from '@/stores/entry-store';
import { QuickCapture } from '@/components/capture/QuickCapture';
import { EntryCard } from '@/components/cards/EntryCard';
import { EntryCardSkeleton } from '@/components/cards/EntryCardSkeleton';
import { CategoryTabs } from '@/components/dashboard/CategoryTabs';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { ReminderCheck } from '@/components/dashboard/ReminderCheck';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Entry } from '@/types';

// Lazy load heavy modal component (performance: reduce initial bundle)
const EntryEditModal = dynamic(
  () => import('@/components/entry/EntryEditModal').then((m) => ({ default: m.EntryEditModal })),
  { ssr: false }
);

export default function DashboardPage() {
  const entries = useEntryStore((s) => s.entries);
  const loading = useEntryStore((s) => s.loading);
  const fetchEntries = useEntryStore((s) => s.fetchEntries);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [reclassifying, setReclassifying] = useState(false);

  const filter = useEntryStore((s) => s.filter);
  // M3: useMemo to avoid recalculating on every render
  const inboxCount = useMemo(
    () => entries.filter((e) => e.category === 'inbox').length,
    [entries]
  );

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

  // M7: Empty deps - fetchEntries reference is stable from Zustand
  useEffect(() => {
    fetchEntries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Quick Capture */}
      <QuickCapture />

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
        </div>
        <SearchBar />
      </div>

      {/* Entry List */}
      <div className="space-y-2">
        {loading && entries.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <EntryCardSkeleton key={i} />
          ))
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">아직 기록이 없습니다</p>
            <p className="text-sm mt-1">위 입력창에 생각을 입력해보세요!</p>
          </div>
        ) : (
          entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onClick={() => setSelectedEntry(entry)}
            />
          ))
        )}
      </div>

      {/* Edit Modal (lazy loaded) */}
      {selectedEntry && (
        <EntryEditModal
          entry={selectedEntry}
          open={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      <ReminderCheck />
    </div>
  );
}
