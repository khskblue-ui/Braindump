'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUploaded: (imageUrl: string, thumbnailUrl: string) => void;
  onRemove: () => void;
  currentUrl: string | null;
}

export function ImageUpload({ onUploaded, onRemove, currentUrl }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Handle clipboard paste
  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await uploadFile(file);
          return;
        }
      }
    };

    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = async (file: File) => {
    // Validate
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지는 5MB 이하만 가능합니다.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('JPEG, PNG, WebP 형식만 지원합니다.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const { image_url, image_thumbnail_url } = await res.json();
      onUploaded(image_url, image_thumbnail_url);
      toast.success('이미지 업로드 완료');
    } catch {
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = '';
  };

  if (currentUrl) {
    return (
      <div className="relative inline-block">
        <img
          src={currentUrl}
          alt="첨부 이미지"
          className="h-20 rounded-md border object-cover"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
          onClick={onRemove}
        >
          <X className="h-3 w-3" strokeWidth={1.5} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="gap-1.5"
      >
        <Upload className="h-4 w-4" strokeWidth={1.5} />
        {uploading ? '업로드 중...' : '파일 선택'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const input = fileInputRef.current;
          if (input) {
            input.setAttribute('capture', 'environment');
            input.click();
            input.removeAttribute('capture');
          }
        }}
        disabled={uploading}
        className="gap-1.5"
      >
        <Camera className="h-4 w-4" strokeWidth={1.5} />
        카메라
      </Button>
      <span className="text-xs text-muted-foreground self-center">
        또는 Ctrl+V로 붙여넣기
      </span>
    </div>
  );
}
