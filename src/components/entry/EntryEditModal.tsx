'use client';

import { useState, useEffect, useRef } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import type { Entry, EntryCategory, EntryPriority } from '@/types';
import { CATEGORIES } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EntryEditModalProps {
  entry: Entry;
  open: boolean;
  onClose: () => void;
}

export function EntryEditModal({ entry, open, onClose }: EntryEditModalProps) {
  const { updateEntry, deleteEntry } = useEntryStore();
  const [rawText, setRawText] = useState(entry.raw_text || '');
  const [summary, setSummary] = useState(entry.summary || '');
  const [category, setCategory] = useState<EntryCategory>(entry.category);
  const [tagsInput, setTagsInput] = useState(entry.tags.join(', '));
  const [topic, setTopic] = useState(entry.topic || '');
  const [priority, setPriority] = useState<EntryPriority | ''>(entry.priority || '');
  const [dueDate, setDueDate] = useState(
    entry.due_date ? entry.due_date.slice(0, 16) : ''
  );
  const [saving, setSaving] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  // H4: Track reminder timeout for cleanup
  const reminderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // H4: Cleanup reminder timeout on unmount
  useEffect(() => {
    return () => {
      if (reminderTimeoutRef.current) {
        clearTimeout(reminderTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEntry(entry.id, {
        raw_text: rawText || undefined,
        summary: summary || null,
        category,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        topic: topic || null,
        priority: (priority as EntryPriority) || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
      toast.success('수정되었습니다.');
      onClose();
    } catch {
      toast.error('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

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

  // C3: Single API call, update store directly from result (no double call)
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

      // Update local modal state
      if (result.category) setCategory(result.category);
      if (result.tags) setTagsInput(result.tags.join(', '));
      if (result.topic) setTopic(result.topic);
      if (result.priority) setPriority(result.priority);
      if (result.summary) setSummary(result.summary);
      if (result.due_date) setDueDate(result.due_date.slice(0, 16));

      // Update store directly (no second API call)
      useEntryStore.setState((state) => ({
        entries: state.entries.map((e) =>
          e.id === entry.id
            ? {
                ...e,
                category: result.category ?? e.category,
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

  const handleRequestReminder = async () => {
    if (!dueDate) {
      toast.warning('먼저 날짜/시간을 설정해주세요.');
      return;
    }
    if (!('Notification' in window)) {
      toast.error('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error('알림 권한이 거부되었습니다.');
      return;
    }
    const due = new Date(dueDate).getTime();
    const now = Date.now();
    const delay = due - now - 10 * 60 * 1000; // 10 minutes before
    if (delay <= 0) {
      toast.warning('일정이 이미 지났거나 10분 이내입니다.');
      return;
    }
    // H4: Clear previous timer and track new one
    if (reminderTimeoutRef.current) {
      clearTimeout(reminderTimeoutRef.current);
    }
    reminderTimeoutRef.current = setTimeout(() => {
      new Notification('BrainDump 리마인드', {
        body: summary || rawText || '일정이 곧 시작됩니다',
        icon: '/icons/icon-192x192.png',
      });
    }, delay);
    toast.success('리마인드가 설정되었습니다. (10분 전 알림)');
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>항목 편집</span>
            <span className="text-xs text-muted-foreground font-normal">
              {formatDistanceToNow(new Date(entry.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {entry.image_url && (
            <img
              src={entry.image_url}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full max-h-64 object-contain rounded-md border"
            />
          )}

          {entry.extracted_text && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-1">AI 추출 텍스트</p>
              <p className="text-sm">{entry.extracted_text}</p>
            </div>
          )}

          {/* AI Title / Summary */}
          <div>
            <label className="text-sm font-medium">제목 (AI 자동생성)</label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="AI가 자동 생성한 제목입니다. 수정 가능합니다."
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              AI가 자동 생성한 제목입니다. 수정 가능합니다.
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium">내용</label>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium">카테고리</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={category === cat.value ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setCategory(cat.value)}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.label}
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium">태그 (쉼표로 구분)</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="태그1, 태그2, 태그3"
              className="mt-1"
            />
          </div>

          {/* Topic (for knowledge) */}
          {category === 'knowledge' && (
            <div>
              <label className="text-sm font-medium">주제</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="주제명"
                className="mt-1"
              />
            </div>
          )}

          {/* Due date + reminder (for schedule) */}
          {category === 'schedule' && (
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">날짜/시간</label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRequestReminder}
                className="w-full text-xs"
              >
                🔔 리마인드 알림 설정 (10분 전)
              </Button>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="text-sm font-medium">우선순위</label>
            <div className="flex gap-1.5 mt-1">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <Badge
                  key={p}
                  variant={priority === p ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setPriority(priority === p ? '' : p)}
                >
                  {p === 'high' ? '🔴 높음' : p === 'medium' ? '🟡 보통' : '🟢 낮음'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" strokeWidth={1.5} />
                삭제
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReclassify}
                disabled={reclassifying}
              >
                <Sparkles className="h-4 w-4 mr-1" strokeWidth={1.5} />
                {reclassifying ? '분류 중...' : 'AI 재분류'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                취소
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
