'use client';

import { useEntryStore } from '@/stores/entry-store';
import { CATEGORIES } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CategoryTabs() {
  const { filter, setFilter } = useEntryStore();
  const current = filter.category || 'all';

  return (
    <div className="relative">
      <Tabs
        value={current}
        onValueChange={(value) =>
          setFilter({ ...filter, category: value === 'all' ? undefined : (value as typeof filter.category) })
        }
      >
        <TabsList
          className="w-full flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{
            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          }}
        >
          <TabsTrigger value="all" className="flex-shrink-0 snap-start text-xs transition-colors duration-150">
            전체
          </TabsTrigger>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="flex-shrink-0 snap-start text-xs gap-1.5 transition-colors duration-150">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: cat.color }}
              />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
