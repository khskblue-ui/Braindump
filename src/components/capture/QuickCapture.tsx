'use client';

import { useState, useRef, useEffect } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { ImageUpload } from './ImageUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

export function QuickCapture() {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createEntry = useEntryStore((s) => s.createEntry);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    if (!trimmedText && !imageUrl) return;

    setSubmitting(true);
    try {
      const inputType = trimmedText && imageUrl ? 'mixed' : imageUrl ? 'image' : 'text';
      await createEntry({
        raw_text: trimmedText || undefined,
        image_url: imageUrl || undefined,
        image_thumbnail_url: thumbnailUrl || undefined,
        input_type: inputType,
      });

      setText('');
      setImageUrl(null);
      setThumbnailUrl(null);
      setShowImageUpload(false);
      toast.success('저장되었습니다. AI가 분류 중...');
      textareaRef.current?.focus();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '저장에 실패했습니다.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUploaded = (url: string, thumbnail: string) => {
    setImageUrl(url);
    setThumbnailUrl(thumbnail);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="생각을 입력하세요... (Enter로 저장, Shift+Enter로 줄바꿈)"
          className="min-h-[80px] pr-20 resize-none"
          disabled={submitting}
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowImageUpload(!showImageUpload)}
          >
            <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            type="button"
            size="icon"
            className="h-8 w-8"
            onClick={handleSubmit}
            disabled={submitting || (!text.trim() && !imageUrl)}
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {showImageUpload && (
        <ImageUpload
          onUploaded={handleImageUploaded}
          onRemove={() => {
            setImageUrl(null);
            setThumbnailUrl(null);
          }}
          currentUrl={thumbnailUrl}
        />
      )}
    </div>
  );
}
