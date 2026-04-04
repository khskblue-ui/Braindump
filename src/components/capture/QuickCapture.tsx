'use client';

import { useState, useRef, useEffect } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { ImageUpload } from './ImageUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ImagePlus, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function QuickCapture() {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const createEntry = useEntryStore((s) => s.createEntry);
  const fetchEntries = useEntryStore((s) => s.fetchEntries);

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

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('PDF 파일만 지원합니다.');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('10MB 이하의 PDF만 가능합니다.');
      e.target.value = '';
      return;
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      // Reset file input after fetch completes (not before)
      e.target.value = '';

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`서버 오류 (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'PDF 처리에 실패했습니다.');
      }

      // Refresh entries to show the new PDF entry
      await fetchEntries();

      const pages = data.pages || '?';
      const chars = data.textLength ? `${Math.round(data.textLength / 1000)}K자` : '';
      toast.success(`PDF 처리 완료 (${pages}페이지, ${chars}). AI가 분류했습니다.`);

      if (data.classifyError) {
        toast.warning(data.classifyError);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'PDF 처리에 실패했습니다.';
      toast.error(msg);
    } finally {
      setUploadingPdf(false);
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

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <div className={`relative rounded-xl transition-shadow duration-200 ${isFocused ? 'ring-2 ring-blue-400/50 shadow-md' : ''}`}>
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="생각을 입력하세요... (Enter로 저장, Shift+Enter로 줄바꿈)"
          className="min-h-[80px] pr-24 resize-none"
          disabled={submitting || uploadingPdf}
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          {/* PDF Upload */}
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => pdfInputRef.current?.click()}
            disabled={uploadingPdf}
            title="PDF 업로드"
          >
            <FileText className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          {/* Image Upload */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowImageUpload(!showImageUpload)}
            disabled={uploadingPdf}
          >
            <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          {/* Send */}
          <Button
            type="button"
            size="icon"
            className="h-8 w-8"
            onClick={handleSubmit}
            disabled={submitting || uploadingPdf || (!text.trim() && !imageUrl)}
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* PDF uploading indicator */}
      {uploadingPdf && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          PDF 분석 중... (텍스트 추출 + AI 요약)
        </div>
      )}

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
