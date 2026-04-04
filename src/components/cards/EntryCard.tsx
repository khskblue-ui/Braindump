'use client';

import { memo } from 'react';
import { Entry, CATEGORY_MAP } from '@/types';
import { useEntryStore } from '@/stores/entry-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Square, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
}

// M4: React.memo to prevent unnecessary re-renders
export const EntryCard = memo(function EntryCard({ entry, onClick }: EntryCardProps) {
  const toggleComplete = useEntryStore((s) => s.toggleComplete);
  const cat = CATEGORY_MAP[entry.category];

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Thumbnail */}
          {entry.image_thumbnail_url && (
            <img
              src={entry.image_thumbnail_url}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-16 h-16 rounded-md object-cover flex-shrink-0"
            />
          )}

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Category + time */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-md"
                style={{
                  backgroundColor: cat?.color ? `${cat.color}18` : undefined,
                  color: cat?.color,
                }}
              >
                {cat?.label}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(new Date(entry.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>

            {/* Text content */}
            <div className="flex items-start gap-2">
              {entry.input_type === 'pdf' && (
                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" strokeWidth={1.5} />
              )}
              {entry.category === 'task' && entry.input_type !== 'pdf' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(entry.id);
                  }}
                  className="mt-0.5 flex-shrink-0"
                >
                  {entry.is_completed ? (
                    <Check className="h-4 w-4 text-green-500" strokeWidth={1.5} />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  )}
                </button>
              )}
              <p
                className={`text-sm line-clamp-2 ${
                  entry.is_completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {entry.summary || entry.raw_text || entry.extracted_text || '(이미지)'}
              </p>
            </div>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                    #{tag}
                  </Badge>
                ))}
                {entry.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{entry.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Due date for schedule entries */}
            {entry.category === 'schedule' && entry.due_date && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(entry.due_date), 'M월 d일 (EEE) HH:mm', { locale: ko })}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
