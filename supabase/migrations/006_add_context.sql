-- Add context column for personal/work distinction (applies to task/schedule entries)
ALTER TABLE entries ADD COLUMN IF NOT EXISTS context TEXT DEFAULT NULL;
