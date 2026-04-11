'use client';

import { useEntryStore } from '@/stores/entry-store';
import { CATEGORIES } from '@/types';
import type { EntryContext } from '@/types';

export function CategoryTabs() {
  const filter = useEntryStore((s) => s.filter);
  const setFilter = useEntryStore((s) => s.setFilter);
  const current = filter.category || 'all';

  const handleClick = (value: string) => {
    // Keep context filter when category changes (global filter)
    setFilter({
      ...filter,
      category: value === 'all' ? undefined : (value as typeof filter.category),
    });
  };

  const handleContextClick = (ctx: EntryContext | undefined) => {
    setFilter({ ...filter, context: ctx });
  };

  const showContextFilter = true;

  return (
    <div className="space-y-1">
      <div
        className="flex gap-1.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-1"
        style={{
          maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
        }}
      >
        <button
          type="button"
          onClick={() => handleClick('all')}
          className={`flex-shrink-0 snap-start text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            current === 'all'
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => {
          const isSelected = current === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleClick(cat.value)}
              className={`flex-shrink-0 snap-start text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
              style={{
                backgroundColor: cat.color + (isSelected ? '30' : '15'),
                color: cat.color,
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
      {showContextFilter && (
        <div className="flex gap-1.5 py-0.5">
          {([
            { label: '전체', value: undefined },
            { label: '개인', value: 'personal' as EntryContext },
            { label: '회사', value: 'work' as EntryContext },
          ] as const).map((item) => {
            const isSelected = filter.context === item.value;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleContextClick(item.value)}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                  isSelected
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
