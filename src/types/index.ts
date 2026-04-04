export type EntryCategory = 'task' | 'idea' | 'memo' | 'knowledge' | 'schedule' | 'inbox';
export type EntryInputType = 'text' | 'image' | 'mixed' | 'pdf';
export type EntryPriority = 'high' | 'medium' | 'low';
export type ReminderOption = '1week' | '2days' | '1day' | '1hour' | '10min';

export const REMINDER_OPTIONS: { value: ReminderOption; label: string; ms: number }[] = [
  { value: '1week', label: '1주일 전', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: '2days', label: '2일 전', ms: 2 * 24 * 60 * 60 * 1000 },
  { value: '1day', label: '1일 전', ms: 24 * 60 * 60 * 1000 },
  { value: '1hour', label: '1시간 전', ms: 60 * 60 * 1000 },
  { value: '10min', label: '10분 전', ms: 10 * 60 * 1000 },
];

export interface Entry {
  id: string;
  user_id: string;
  raw_text: string | null;
  image_url: string | null;
  image_thumbnail_url: string | null;
  extracted_text: string | null;
  categories: EntryCategory[];
  tags: string[];
  topic: string | null;
  summary: string | null;
  due_date: string | null;
  priority: EntryPriority | null;
  is_completed: boolean;
  is_pinned: boolean;
  reminders: ReminderOption[];
  input_type: EntryInputType;
  ai_metadata: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEntryInput {
  raw_text?: string;
  image_url?: string;
  image_thumbnail_url?: string;
  input_type: EntryInputType;
}

export interface UpdateEntryInput {
  raw_text?: string;
  categories?: EntryCategory[];
  tags?: string[];
  topic?: string | null;
  summary?: string | null;
  due_date?: string | null;
  priority?: EntryPriority | null;
  is_completed?: boolean;
  is_pinned?: boolean;
  deleted_at?: string | null;
  reminders?: ReminderOption[];
}

export interface ClassifyResult {
  categories: EntryCategory[];
  tags: string[];
  topic?: string;
  extracted_text?: string;
  summary?: string;
  due_date?: string;
  priority?: EntryPriority;
  related_topics?: string[];
}

export interface TopicInfo {
  name: string;
  count: number;
  latest: string;
}

export interface TagInfo {
  name: string;
  count: number;
}

export const CATEGORIES: { value: EntryCategory; label: string; color: string }[] = [
  { value: 'task', label: '할 일', color: '#3B82F6' },
  { value: 'idea', label: '아이디어', color: '#EAB308' },
  { value: 'memo', label: '메모', color: '#22C55E' },
  { value: 'knowledge', label: '지식', color: '#A855F7' },
  { value: 'schedule', label: '일정', color: '#F97316' },
  { value: 'inbox', label: '미분류', color: '#9CA3AF' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
) as Record<EntryCategory, (typeof CATEGORIES)[number]>;

/** Get the primary (first) category of an entry */
export function primaryCategory(entry: { categories?: EntryCategory[] }): EntryCategory {
  return entry.categories?.[0] || 'inbox';
}

/** Check if entry belongs to a category */
export function hasCategory(entry: { categories?: EntryCategory[] }, cat: EntryCategory): boolean {
  return entry.categories?.includes(cat) ?? false;
}
