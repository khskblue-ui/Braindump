'use client';

import { useState, useMemo } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import type { Entry } from '@/types';
import { CATEGORY_MAP, hasCategory } from '@/types';
import {
  Dialog,
  DialogContentFullscreen,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Sparkles, ArrowLeft, FileText, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { downloadICS, getGoogleCalendarUrl } from '@/lib/calendar';

interface EntryViewerModalProps {
  entry: Entry;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function EntryViewerModal({ entry, open, onClose, onEdit }: EntryViewerModalProps) {
  const deleteEntry = useEntryStore((s) => s.deleteEntry);
  const [reclassifying, setReclassifying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Multi-category display handled below
  const displayText = entry.extracted_text || entry.raw_text || '';

  // Split pages by double newline (pages separated by \n\n in extraction)
  const pages = useMemo(() => {
    return displayText.split(/\n{2,}/).filter(p => p.trim().length > 0);
  }, [displayText]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteEntry(entry.id);
      toast.success('삭제되었습니다.');
      onClose();
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleReclassify = async () => {
    setReclassifying(true);
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entry.id }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();

      useEntryStore.setState((state) => ({
        entries: state.entries.map((e) =>
          e.id === entry.id
            ? {
                ...e,
                categories: result.categories ?? e.categories,
                tags: result.tags ?? e.tags,
                topic: result.topic ?? e.topic,
                summary: result.summary ?? e.summary,
                extracted_text: result.extracted_text ?? e.extracted_text,
                due_date: result.due_date ?? e.due_date,
                priority: result.priority ?? e.priority,
              }
            : e
        ),
      }));
      toast.success('AI가 재분류했습니다.');
    } catch {
      toast.error('재분류에 실패했습니다.');
    } finally {
      setReclassifying(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('텍스트가 복사되었습니다.');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContentFullscreen showCloseButton={false}>
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 via-purple-50/80 to-pink-50 border-b border-border/50">
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            <button
              onClick={onClose}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="뒤로"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <DialogTitle className="flex-1 truncate text-base font-semibold">
              {entry.summary || entry.raw_text?.slice(0, 40) || '항목 보기'}
            </DialogTitle>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 px-4 pb-2.5 overflow-x-auto">
            {entry.categories.map((c) => {
              const catInfo = CATEGORY_MAP[c];
              return (
                <span
                  key={c}
                  className="text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0"
                  style={{
                    backgroundColor: catInfo?.color ? `${catInfo.color}18` : undefined,
                    color: catInfo?.color,
                  }}
                >
                  {catInfo?.label}
                </span>
              );
            })}
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0 flex-shrink-0">
                #{tag}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-auto">
              {formatDistanceToNow(new Date(entry.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image if present */}
          {entry.image_url && (
            <div className="px-4 pt-4">
              <img
                src={entry.image_url}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full max-h-80 object-contain rounded-lg border"
              />
            </div>
          )}

          {/* Source info for PDF */}
          {entry.input_type === 'pdf' && (
            <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 bg-blue-50/60 rounded-lg text-xs text-blue-600">
              <FileText className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
              <span>PDF 추출 텍스트</span>
              <span className="text-blue-400">|</span>
              <span>{displayText.length.toLocaleString()}자</span>
              <button
                onClick={handleCopy}
                className="ml-auto flex items-center gap-1 hover:text-blue-800 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
          )}

          {/* Text content with page breaks */}
          <div className="px-5 py-4" style={{ contentVisibility: 'auto' }}>
            {pages.map((page, i) => (
              <div key={i}>
                <p className="text-[15px] leading-7 whitespace-pre-line text-foreground/90">
                  {page}
                </p>
                {i < pages.length - 1 && (
                  <hr className="my-6 border-border/40" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fixed bottom actions */}
        <div className="flex-shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-sm safe-area-bottom">
          {/* Calendar buttons for task/schedule with due_date */}
          {(hasCategory(entry, 'task') || hasCategory(entry, 'schedule')) && entry.due_date && (
            <div className="flex gap-2 px-4 pt-2.5 pb-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadICS(entry)}
                className="flex-1 text-xs"
              >
                Apple 캘린더
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(getGoogleCalendarUrl(entry), '_blank')}
                className="flex-1 text-xs"
              >
                Google 캘린더
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReclassify}
                disabled={reclassifying}
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-xs ml-1">{reclassifying ? '분류 중...' : 'AI 재분류'}</span>
              </Button>
            </div>
            <Button size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1" strokeWidth={1.5} />
              편집
            </Button>
          </div>
        </div>
      </DialogContentFullscreen>
    </Dialog>
  );
}
