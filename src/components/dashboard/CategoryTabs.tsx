'use client';

import { useEntryStore } from '@/stores/entry-store';
import { CATEGORIES } from '@/types';

export function CategoryTabs() {
  const { filter, setFilter } = useEntryStore();
  const current = filter.category || 'all';

  const handleClick = (value: string) => {
    setFilter({ ...filter, category: value === 'all' ? undefined : (value as typeof filter.category) });
  };

  return (
    <div
      className="flex gap-1.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-0.5"
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
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => handleClick(cat.value)}
          className={`flex-shrink-0 snap-start text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            current === cat.value ? '' : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            backgroundColor: `${cat.color}18`,
            color: cat.color,
            outlineColor: current === cat.value ? cat.color : undefined,
            outlineWidth: current === cat.value ? '2px' : undefined,
            outlineOffset: '1px',
            outlineStyle: current === cat.value ? 'solid' : undefined,
          }}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
