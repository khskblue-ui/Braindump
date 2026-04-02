'use client';

import { useState } from 'react';
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
import { Trash2 } from 'lucide-react';
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
  const [category, setCategory] = useState<EntryCategory>(entry.category);
  const [tagsInput, setTagsInput] = useState(entry.tags.join(', '));
  const [topic, setTopic] = useState(entry.topic || '');
  const [priority, setPriority] = useState<EntryPriority | ''>(entry.priority || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEntry(entry.id, {
        raw_text: rawText || undefined,
        category,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        topic: topic || null,
        priority: (priority as EntryPriority) || null,
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
          {/* Image preview */}
          {entry.image_url && (
            <img
              src={entry.image_url}
              alt=""
              className="w-full max-h-64 object-contain rounded-md border"
            />
          )}

          {/* Extracted text from image */}
          {entry.extracted_text && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-1">AI 추출 텍스트</p>
              <p className="text-sm">{entry.extracted_text}</p>
            </div>
          )}

          {/* Text */}
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
                  {cat.icon} {cat.label}
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
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
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
