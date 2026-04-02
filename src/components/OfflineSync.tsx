'use client';

import { useEffect } from 'react';
import { useOfflineStore } from '@/stores/offline-store';
import { toast } from 'sonner';

export function OfflineSync() {
  const setOnline = useOfflineStore((s) => s.setOnline);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      toast.success('온라인으로 전환되었습니다. 동기화 중...');
    };

    const handleOffline = () => {
      setOnline(false);
      toast.warning('오프라인 모드입니다. 텍스트 입력은 로컬에 저장됩니다.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return null;
}
