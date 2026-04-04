'use client';

import { useEffect, useState, useRef } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

export default function TrashPage() {
  const { trashEntries, fetchTrash, restoreEntry, permanentDelete, emptyTrash } =
    useEntryStore();

  // Inline confirmation state: 'empty' for the empty-trash button, or an entry id for per-item delete
  const [confirmState, setConfirmState] = useState<'empty' | string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  // Clear confirmation state and any pending reset timer
  const clearConfirm = () => {
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
    setConfirmState(null);
  };

  // Start a 3-second auto-reset for the confirmation UI
  const startConfirm = (key: 'empty' | string) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setConfirmState(key);
    confirmTimerRef.current = setTimeout(() => {
      setConfirmState(null);
      confirmTimerRef.current = null;
    }, 3000);
  };

  const handleRestore = async (id: string) => {
    clearConfirm();
    try {
      await restoreEntry(id);
      toast('항목을 복원했습니다.');
    } catch {
      toast.error('복원에 실패했습니다.');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirmState !== id) {
      startConfirm(id);
      return;
    }
    clearConfirm();
    try {
      await permanentDelete(id);
      toast('항목을 영구 삭제했습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleEmptyTrash = async () => {
    if (confirmState !== 'empty') {
      startConfirm('empty');
      return;
    }
    clearConfirm();
    try {
      await emptyTrash();
      toast('휴지통을 비웠습니다.');
    } catch {
      toast.error('휴지통 비우기에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Trash2 className="h-5 w-5" strokeWidth={1.5} /> 휴지통
        </h1>
        {trashEntries.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmptyTrash}
          >
            {confirmState === 'empty' ? '정말 비우시겠습니까?' : '전체 비우기'}
          </Button>
        )}
      </div>

      {trashEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            휴지통이 비어있습니다
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {trashEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {entry.summary || entry.raw_text || entry.extracted_text || '(내용 없음)'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {entry.deleted_at
                      ? `${formatDistanceToNow(new Date(entry.deleted_at), {
                          addSuffix: true,
                          locale: ko,
                        })} 삭제`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRestore(entry.id)}
                    title="복원"
                  >
                    <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 text-destructive hover:text-destructive${confirmState === entry.id ? ' bg-destructive/10' : ''}`}
                    onClick={() => handlePermanentDelete(entry.id)}
                    title={confirmState === entry.id ? '한 번 더 클릭하면 삭제됩니다' : '영구 삭제'}
                  >
                    {confirmState === entry.id ? (
                      <span className="text-[10px] font-medium leading-none">확인</span>
                    ) : (
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
