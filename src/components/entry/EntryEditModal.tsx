'use client';

import { useState } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import type { Entry, EntryCategory, EntryPriority, ReminderOption } from '@/types';
import { CATEGORIES, REMINDER_OPTIONS } from '@/types';
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
import { downloadICS, getGoogleCalendarUrl } from '@/lib/calendar';

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
  const [reminders, setReminders] = useState<ReminderOption[]>(entry.reminders || []);
  const [saving, setSaving] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);

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
        reminders,
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

  const priorityConfig = {
    high: { label: '높음', color: '#EF4444' },
    medium: { label: '보통', color: '#EAB308' },
    low: { label: '낮음', color: '#22C55E' },
  } as const;

  const showDueDate = category === 'task' || category === 'schedule';
  const dueDateLabel = category === 'schedule' ? '날짜/시간' : '마감일 (선택)';

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto !p-0">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50/80 to-pink-50 px-4 pt-4 pb-3 rounded-t-xl border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="pr-8">
              항목 편집
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(entry.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </p>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-4 pt-2 pb-4">
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
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors">
                <span className="text-xs text-muted-foreground font-medium">AI 추출 텍스트</span>
                <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-3 bg-muted rounded-b-md border-t border-border/30 max-h-64 overflow-y-auto">
                <p className="text-sm whitespace-pre-line leading-relaxed">{entry.extracted_text}</p>
              </div>
            </details>
          )}

          {/* AI Title / Summary */}
          <div>
            <label className="text-sm font-medium">제목 (AI 자동생성)</label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="AI가 자동 생성한 제목입니다. 수정 가능합니다."
              className="mt-1 focus-visible:ring-blue-400/50"
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
              className="mt-1 focus-visible:ring-blue-400/50"
              rows={3}
            />
          </div>

          {/* Category - colored badge style matching EntryCard */}
          <div>
            <label className="text-sm font-medium">카테고리</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                    category === cat.value
                      ? ''
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${cat.color}18`,
                    color: cat.color,
                    outlineColor: category === cat.value ? cat.color : undefined,
                    outlineWidth: category === cat.value ? '2px' : undefined,
                    outlineOffset: '1px',
                    outlineStyle: category === cat.value ? 'solid' : undefined,
                  }}
                >
                  {cat.label}
                </button>
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
              className="mt-1 focus-visible:ring-blue-400/50"
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
                className="mt-1 focus-visible:ring-blue-400/50"
              />
            </div>
          )}

          {/* Due date (for task and schedule) */}
          {showDueDate && (
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">{dueDateLabel}</label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 focus-visible:ring-blue-400/50"
                />
              </div>

              {/* Calendar export buttons */}
              {dueDate && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const e = { ...entry, due_date: new Date(dueDate).toISOString(), summary, raw_text: rawText };
                      downloadICS(e as Entry);
                    }}
                    className="flex-1 text-xs"
                  >
                    Apple 캘린더
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const e = { ...entry, due_date: new Date(dueDate).toISOString(), summary, raw_text: rawText };
                      window.open(getGoogleCalendarUrl(e as Entry), '_blank');
                    }}
                    className="flex-1 text-xs"
                  >
                    Google 캘린더
                  </Button>
                </div>
              )}

              {/* Reminder selector */}
              {dueDate && (
                <div>
                  <label className="text-sm font-medium">리마인드 알림 (최대 2개)</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {REMINDER_OPTIONS.map((opt) => {
                      const selected = reminders.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setReminders(reminders.filter(r => r !== opt.value));
                            } else if (reminders.length < 2) {
                              setReminders([...reminders, opt.value]);
                            }
                          }}
                          className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                            selected
                              ? 'bg-blue-100 text-blue-700 outline outline-2 outline-offset-1 outline-blue-500'
                              : reminders.length >= 2
                                ? 'bg-muted text-muted-foreground opacity-40 cursor-not-allowed'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          disabled={!selected && reminders.length >= 2}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Priority - colored dot style, no emoji */}
          <div>
            <label className="text-sm font-medium">우선순위</label>
            <div className="flex gap-1.5 mt-1">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(priority === p ? '' : p)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    priority === p
                      ? ''
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${priorityConfig[p].color}18`,
                    color: priorityConfig[p].color,
                    outlineColor: priority === p ? priorityConfig[p].color : undefined,
                    outlineWidth: priority === p ? '2px' : undefined,
                    outlineOffset: '1px',
                    outlineStyle: priority === p ? 'solid' : undefined,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: priorityConfig[p].color }}
                  />
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with separator */}
        <div className="flex justify-between px-4 py-3 border-t border-border/50 bg-muted/30 rounded-b-xl">
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
      </DialogContent>
    </Dialog>
  );
}
