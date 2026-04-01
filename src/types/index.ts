export type EntryCategory = 'task' | 'idea' | 'memo' | 'knowledge' | 'schedule' | 'inbox';
export type EntryInputType = 'text' | 'image' | 'mixed';
export type EntryPriority = 'high' | 'medium' | 'low';

export interface Entry {
  id: string;
  user_id: string;
  raw_text: string | null;
  image_url: string | null;
  image_thumbnail_url: string | null;
  extracted_text: string | null;
  category: EntryCategory;
  tags: string[];
  topic: string | null;
  summary: string | null;
  due_date: string | null;
  priority: EntryPriority | null;
  is_completed: boolean;
  input_type: EntryInputType;
  ai_metadata: Record<string, unknown>;
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
  category?: EntryCategory;
  tags?: string[];
  topic?: string | null;
  summary?: string;
  due_date?: string | null;
  priority?: EntryPriority | null;
  is_completed?: boolean;
}

export interface ClassifyResult {
  category: EntryCategory;
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

export const CATEGORIES: { value: EntryCategory; label: string; icon: string }[] = [
  { value: 'task', label: '할 일', icon: '✅' },
  { value: 'idea', label: '아이디어', icon: '💡' },
  { value: 'memo', label: '메모', icon: '📝' },
  { value: 'knowledge', label: '지식', icon: '📚' },
  { value: 'schedule', label: '일정', icon: '📅' },
  { value: 'inbox', label: '미분류', icon: '📥' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
) as Record<EntryCategory, (typeof CATEGORIES)[number]>;
