'use client';

import { memo } from 'react';
import { Entry, CATEGORY_MAP, hasCategory, primaryCategory } from '@/types';
import { useEntryStore } from '@/stores/entry-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Square, Clock, FileText, Pin, ChevronUp, ChevronDown, User, Building2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EntryCardProps {
  entry: Entry;
  onClick?: (entry: Entry) => void;
  sortMode?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

// M4: React.memo to prevent unnecessary re-renders
export const EntryCard = memo(function EntryCard({ entry, onClick, sortMode, onMoveUp, onMoveDown, isFirst, isLast }: EntryCardProps) {
  const toggleComplete = useEntryStore((s) => s.toggleComplete);
  const updateEntry = useEntryStore((s) => s.updateEntry);
  const primary = primaryCategory(entry);
  const cat = CATEGORY_MAP[primary];

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] relative"
      onClick={() => onClick?.(entry)}
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
              <div className="flex gap-1">
                {(entry.categories || []).map((c) => {
                  const catInfo = CATEGORY_MAP[c];
                  return (
                    <span
                      key={c}
                      className="text-xs font-medium px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: catInfo?.color ? `${catInfo.color}18` : undefined,
                        color: catInfo?.color,
                      }}
                    >
                      {catInfo?.label}
                    </span>
                  );
                })}
                {entry.context && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateEntry(entry.id, { context: entry.context === 'personal' ? 'work' : 'personal' });
                    }}
                    className="text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                    style={{
                      backgroundColor: entry.context === 'personal' ? '#3B82F618' : '#7C3AED18',
                      color: entry.context === 'personal' ? '#3B82F6' : '#7C3AED',
                    }}
                  >
                    {entry.context === 'personal' ? (
                      <User className="h-3 w-3" strokeWidth={2} />
                    ) : (
                      <Building2 className="h-3 w-3" strokeWidth={2} />
                    )}
                    {entry.context === 'personal' ? '개인' : '회사'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {sortMode ? (
                  <div className="flex flex-col">
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
                      disabled={isFirst}
                      className="p-0.5 text-muted-foreground/50 hover:text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      aria-label="위로 이동"
                    >
                      <ChevronUp className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
                      disabled={isLast}
                      className="p-0.5 text-muted-foreground/50 hover:text-muted-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      aria-label="아래로 이동"
                    >
                      <ChevronDown className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateEntry(entry.id, { is_pinned: !entry.is_pinned });
                      }}
                      className={`p-1.5 -mr-1 rounded transition-colors ${
                        entry.is_pinned
                          ? 'text-blue-400'
                          : 'text-transparent hover:text-muted-foreground/50'
                      }`}
                      aria-label={entry.is_pinned ? '핀 해제' : '핀 고정'}
                    >
                      <Pin className="h-3 w-3" strokeWidth={2} fill={entry.is_pinned ? 'currentColor' : 'none'} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Text content */}
            <div className="flex items-start gap-2">
              {entry.input_type === 'pdf' && (
                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" strokeWidth={1.5} />
              )}
              {hasCategory(entry, 'task') && entry.input_type !== 'pdf' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(entry.id);
                  }}
                  className="flex-shrink-0 p-2 -m-2 flex items-center justify-center"
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
            {hasCategory(entry, 'schedule') && entry.due_date && (
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
