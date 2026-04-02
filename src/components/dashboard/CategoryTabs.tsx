'use client';

import { useEntryStore } from '@/stores/entry-store';
import { CATEGORIES } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CategoryTabs() {
  const { filter, setFilter } = useEntryStore();
  const current = filter.category || 'all';

  return (
    <Tabs
      value={current}
      onValueChange={(value) =>
        setFilter({ ...filter, category: value === 'all' ? undefined : (value as typeof filter.category) })
      }
    >
      <TabsList className="w-full flex overflow-x-auto">
        <TabsTrigger value="all" className="flex-shrink-0 text-xs">
          📋 전체
        </TabsTrigger>
        {CATEGORIES.map((cat) => (
          <TabsTrigger key={cat.value} value={cat.value} className="flex-shrink-0 text-xs">
            {cat.icon} {cat.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
