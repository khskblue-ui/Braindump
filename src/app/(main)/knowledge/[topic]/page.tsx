'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EntryCard } from '@/components/cards/EntryCard';
import { EntryCardSkeleton } from '@/components/cards/EntryCardSkeleton';
import { EntryEditModal } from '@/components/entry/EntryEditModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Pencil, Check, X, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Entry } from '@/types';

export default function TopicDetailPage() {
  const params = useParams();
  const topic = decodeURIComponent(params.topic as string);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(topic);

  useEffect(() => {
    fetch(`/api/topics/${encodeURIComponent(topic)}`)
      .then((res) => res.json())
      .then((data) => setEntries(data.entries || []))
      .finally(() => setLoading(false));
  }, [topic]);

  const handleRename = async () => {
    const newName = editName.trim();
    if (!newName || newName.toLowerCase() === topic.toLowerCase()) {
      setIsEditing(false);
      setEditName(topic);
      return;
    }
    try {
      const res = await fetch(`/api/topics/${encodeURIComponent(topic)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error();
      toast.success('토픽 이름이 변경되었습니다.');
      router.replace(`/knowledge/${encodeURIComponent(newName.toLowerCase())}`);
    } catch {
      toast.error('이름 변경에 실패했습니다.');
      setEditName(topic);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/knowledge">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </Link>
        {isEditing ? (
          <div className="flex items-center gap-1.5 flex-1">
            <BookOpen className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') { setIsEditing(false); setEditName(topic); }
              }}
              className="text-lg font-bold h-8 flex-1"
              autoFocus
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRename}>
              <Check className="h-4 w-4 text-green-600" strokeWidth={2} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setIsEditing(false); setEditName(topic); }}>
              <X className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold flex items-center gap-1.5"><BookOpen className="h-5 w-5 shrink-0" strokeWidth={1.5} />{topic}</h1>
            <span className="text-sm text-muted-foreground">({entries.length}개)</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            </Button>
          </>
        )}
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
