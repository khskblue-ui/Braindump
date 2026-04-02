'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EntryCard } from '@/components/cards/EntryCard';
import { EntryCardSkeleton } from '@/components/cards/EntryCardSkeleton';
import { EntryEditModal } from '@/components/entry/EntryEditModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Entry } from '@/types';

export default function TopicDetailPage() {
  const params = useParams();
  const topic = decodeURIComponent(params.topic as string);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  useEffect(() => {
    fetch(`/api/topics/${encodeURIComponent(topic)}`)
      .then((res) => res.json())
      .then((data) => setEntries(data.entries || []))
      .finally(() => setLoading(false));
  }, [topic]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/knowledge">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">📚 {topic}</h1>
        <span className="text-sm text-muted-foreground">({entries.length}개)</span>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <EntryCardSkeleton key={i} />)
        ) : entries.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">항목이 없습니다</p>
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

      {selectedEntry && (
        <EntryEditModal
          entry={selectedEntry}
          open={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
