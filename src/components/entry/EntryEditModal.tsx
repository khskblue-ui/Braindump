'use client';

import { useState } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import type { Entry, EntryCategory, EntryContext, EntryPriority, ReminderOption } from '@/types';
import { CATEGORIES, REMINDER_OPTIONS, hasCategory } from '@/types';
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
import { Trash2, Sparkles, Pin, PinOff, User, Building2 } from 'lucide-react';
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
  const updateEntry = useEntryStore((s) => s.updateEntry);
  const softDelete = useEntryStore((s) => s.softDelete);
  const restoreEntry = useEntryStore((s) => s.restoreEntry);
  const fetchEntries = useEntryStore((s) => s.fetchEntries);
  const [rawText, setRawText] = useState(entry.raw_text || '');
  const [summary, setSummary] = useState(entry.summary || '');
  const [categories, setCategories] = useState<EntryCategory[]>(entry.categories);
  const [tagsInput, setTagsInput] = useState(entry.tags.join(', '));
  const [topic, setTopic] = useState(entry.topic || '');
  const [priority, setPriority] = useState<EntryPriority | ''>(entry.priority || '');
  const [dueDate, setDueDate] = useState(() => {
    if (!entry.due_date) return '';
    const d = new Date(entry.due_date);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [reminders, setReminders] = useState<ReminderOption[]>(entry.reminders || []);
  const [context, setContext] = useState<EntryContext | null>(entry.context || null);
  const [isPinned, setIsPinned] = useState(entry.is_pinned || false);
  const [saving, setSaving] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        raw_text: rawText || undefined,
        summary: summary || null,
        categories,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        topic: topic || null,
        priority: (priority as EntryPriority) || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        reminders,
        context,
        is_pinned: isPinned,
      };
      // When rawText is modified and entry has extracted_text,
      // sync extracted_text so the viewer shows the latest content
      if (rawText !== (entry.raw_text || '') && entry.extracted_text) {
        updateData.extracted_text = rawText || null;
      }
      await updateEntry(entry.id, updateData);
      toast.success('수정되었습니다.');
      onClose();
    } catch {
      toast.error('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까? 휴지통에서 복원할 수 있습니다.')) return;
    try {
      await softDelete(entry.id);
      toast.success('휴지통으로 이동했습니다.', {
        action: {
          label: '되돌리기',
          onClick: async () => {
            await restoreEntry(entry.id);
            fetchEntries();
          },
        },
        duration: 5000,
      });
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
      if (result.categories) setCategories(result.categories);
      if (result.tags) setTagsInput(result.tags.join(', '));
      if (result.topic) setTopic(result.topic);
      if (result.priority) setPriority(result.priority);
      if (result.summary) setSummary(result.summary);
      if (result.due_date) {
        const d = new Date(result.due_date);
        const pad = (n: number) => String(n).padStart(2, '0');
        setDueDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
      if (result.context !== undefined) setContext(result.context ?? null);

      // Update store directly (no second API call)
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
                context: result.context !== undefined ? (result.context ?? null) : e.context,
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

  const showDueDate = categories.includes('task') || categories.includes('schedule');
  const dueDateLabel = categories.includes('schedule') ? '날짜/시간' : '마감일 (선택)';

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
              {CATEGORIES.map((cat) => {
                const isSelected = categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        // Don't allow empty categories
                        if (categories.length > 1) {
                          setCategories(categories.filter((c) => c !== cat.value));
                        }
                      } else {
                        setCategories([...categories, cat.value]);
                      }
                    }}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                      isSelected
                        ? ''
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: `${cat.color}18`,
                      color: cat.color,
                      outlineColor: isSelected ? cat.color : undefined,
                      outlineWidth: isSelected ? '2px' : undefined,
                      outlineOffset: '1px',
                      outlineStyle: isSelected ? 'solid' : undefined,
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced settings — collapsed by default */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <span>상세 설정</span>
              <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="space-y-4 pt-2">
              {/* Context (personal/work) */}
              <div>
                <label className="text-sm font-medium">컨텍스트</label>
                <div className="flex gap-1.5 mt-1">
                  {([
                    { label: '미지정', value: null, icon: null, color: undefined },
                    { label: '개인', value: 'personal' as EntryContext, icon: User, color: '#3B82F6' },
                    { label: '업무', value: 'work' as EntryContext, icon: Building2, color: '#7C3AED' },
                  ] as const).map((item) => {
                    const isSelected = context === item.value;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setContext(item.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                          isSelected
                            ? item.color
                              ? ''
                              : 'bg-foreground text-background'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        style={item.color ? {
                          backgroundColor: `${item.color}18`,
                          color: item.color,
                          outlineColor: isSelected ? item.color : undefined,
                          outlineWidth: isSelected ? '2px' : undefined,
                          outlineOffset: '1px',
                          outlineStyle: isSelected ? 'solid' : undefined,
                        } : isSelected ? undefined : {
                          backgroundColor: 'var(--muted)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {Icon && <Icon className="h-3 w-3" strokeWidth={2} />}
                        {item.label}
                      </button>
                    );
                  })}
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
              {categories.includes('knowledge') && (
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
          </details>
        </div>

        {/* Footer with separator */}
        <div className="flex flex-col gap-2 px-4 py-3 border-t border-border/50 bg-muted/30 rounded-b-xl">
          {/* Secondary actions row */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPinned((prev) => !prev)}
              className={isPinned ? 'text-blue-500 border-blue-300' : ''}
            >
              {isPinned ? (
                <><PinOff className="h-4 w-4 mr-1" strokeWidth={1.5} />핀 해제</>
              ) : (
                <><Pin className="h-4 w-4 mr-1" strokeWidth={1.5} />핀 고정</>
              )}
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
          {/* Primary actions row: destructive far left, confirm far right */}
          <div className="flex justify-between">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" strokeWidth={1.5} />
              삭제
            </Button>
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
