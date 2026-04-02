'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEntryStore } from '@/stores/entry-store';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const setFilter = useEntryStore((s) => s.setFilter);
  const filter = useEntryStore((s) => s.filter);
  const [value, setValue] = useState(filter.query || (filter.tag ? `#${filter.tag}` : ''));
  const lastValueRef = useRef<string>('');
  // H5: Capture latest filter in ref to avoid stale closure
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const applySearch = useCallback((trimmed: string) => {
    if (trimmed.startsWith('#') && !trimmed.includes(' ')) {
      const tag = trimmed.slice(1);
      setFilter({ ...filterRef.current, tag: tag || undefined, query: undefined });
    } else {
      setFilter({ ...filterRef.current, query: trimmed || undefined, tag: undefined });
    }
  }, [setFilter]);

  useEffect(() => {
    const trimmed = value.trim();
    const timer = setTimeout(() => {
      if (trimmed === lastValueRef.current) return;
      lastValueRef.current = trimmed;
      applySearch(trimmed);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, applySearch]);

  const handleSearch = () => {
    const trimmed = value.trim();
    lastValueRef.current = trimmed;
    applySearch(trimmed);
  };

  const handleClear = () => {
    setValue('');
    lastValueRef.current = '';
    setFilter({ ...filterRef.current, query: undefined, tag: undefined });
  };

  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="검색... (#태그명으로 태그 검색)"
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
