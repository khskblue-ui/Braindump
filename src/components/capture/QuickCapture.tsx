'use client';

import { useState, useRef, useEffect } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { ImageUpload } from './ImageUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ImagePlus, FileText, Mic, MicOff } from 'lucide-react';
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

  const handleImageUploaded = (url: string, thumbnail: string) => {
    setImageUrl(url);
    setThumbnailUrl(thumbnail);
  };

  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSpeechSupported(false);
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // Auto-stop after 3s silence
      recognitionRef.current?.stop();
    }, 3000);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setInterimText('');
      setRecordingSeconds(0);
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
      // Start silence timer (auto-stop if no speech detected)
      resetSilenceTimer();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // Reset silence timer on every result
      resetSilenceTimer();

      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (finalChunk) {
        setText((prev) => prev + finalChunk);
        setInterimText('');
      } else {
        setInterimText(interim);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        toast.error('마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요.');
      } else if (event.error !== 'aborted') {
        toast.error(`음성 인식 오류: ${event.error}`);
      }
      setIsRecording(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText('');
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="space-y-2">
      <div className={`relative rounded-xl transition-shadow duration-200 ${
        isRecording ? 'ring-2 ring-red-400/70 shadow-md' :
        isFocused ? 'ring-2 ring-blue-400/50 shadow-md' : ''
      }`}>
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="생각을 입력하세요..."
          className="min-h-[80px] pr-32 resize-none"
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
          {/* Mic */}
          {speechSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
              onClick={toggleRecording}
              disabled={submitting || uploadingPdf}
              title={isRecording ? '음성 인식 중지' : '음성 입력'}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Mic className="h-4 w-4" strokeWidth={1.5} />
              )}
            </Button>
          )}
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

      {/* Voice recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm px-1">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-500 font-medium">듣는 중...</span>
          <span className="text-xs text-muted-foreground">
            {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}
          </span>
          {interimText && (
            <span className="text-muted-foreground/70 truncate flex-1 text-xs italic">
              {interimText}
            </span>
          )}
        </div>
      )}

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
