'use client';

import { useState, useEffect, useRef } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const { filter, setFilter } = useEntryStore();
  const [value, setValue] = useState(filter.query || '');
  const lastQueryRef = useRef<string>('');

  useEffect(() => {
    const trimmed = value.trim();
    const timer = setTimeout(() => {
      if (trimmed === lastQueryRef.current) return;
      lastQueryRef.current = trimmed;
      setFilter({ ...filter, query: trimmed || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const handleSearch = () => {
    const trimmed = value.trim();
    lastQueryRef.current = trimmed;
    setFilter({ ...filter, query: trimmed || undefined });
  };

  const handleClear = () => {
    setValue('');
    lastQueryRef.current = '';
    setFilter({ ...filter, query: undefined });
  };

  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="검색..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
