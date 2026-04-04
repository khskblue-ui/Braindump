'use client';

import { useState, useRef } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const setFilter = useEntryStore((s) => s.setFilter);
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = (text: string) => {
    setValue(text);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const current = useEntryStore.getState().filter;
      setFilter({ ...current, query: text.trim() || undefined });
    }, 300);
  };

  const handleClear = () => {
    setValue('');
    clearTimeout(timerRef.current);
    const current = useEntryStore.getState().filter;
    setFilter({ ...current, query: undefined });
  };

  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="검색..."
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-9 pr-8"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" strokeWidth={1.5} />
          </Button>
        )}
      </div>
    </div>
  );
}
