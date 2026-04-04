'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEntryStore } from '@/stores/entry-store';

function ShareHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const createEntry = useEntryStore((s) => s.createEntry);
  const classifyEntry = useEntryStore((s) => s.classifyEntry);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const title = searchParams.get('title') || '';
    const text = searchParams.get('text') || '';
    const url = searchParams.get('url') || '';

    const parts = [title, text, url].filter(Boolean);
    const combined = parts.join('\n');

    if (!combined) {
      router.replace('/home');
      return;
    }

    createEntry({ raw_text: combined, input_type: 'text' })
      .then((entry) => {
        // Background classification (fire-and-forget)
        classifyEntry(entry.id);
        router.replace('/home');
      })
      .catch(() => {
        router.replace('/home');
      });
  }, [searchParams, createEntry, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground text-sm">저장 중...</p>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground text-sm">저장 중...</p>
        </div>
      }
    >
      <ShareHandler />
    </Suspense>
  );
}
