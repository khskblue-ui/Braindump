'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    let cleanup: (() => void) | void;
    initialize().then((unsub) => { cleanup = unsub; });
    return () => cleanup?.();
  }, [initialize]);

  return <>{children}</>;
}
