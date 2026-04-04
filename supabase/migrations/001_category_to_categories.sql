-- Migration: category (enum) → categories (text[])
-- Enables multi-category entries (e.g., a single entry can be both 'task' and 'schedule')

-- 1. Add new categories column as text[]
ALTER TABLE entries ADD COLUMN categories TEXT[] DEFAULT '{inbox}';

-- 2. Migrate existing data: copy category enum value into categories array
UPDATE entries SET categories = ARRAY[category::text];

-- 3. Drop old indexes that reference the category column
DROP INDEX IF EXISTS idx_entries_category;
DROP INDEX IF EXISTS idx_entries_completed;

-- 4. Drop old category column
ALTER TABLE entries DROP COLUMN category;

-- 5. Create new indexes for the categories array
CREATE INDEX idx_entries_categories ON entries USING GIN(categories);
CREATE INDEX idx_entries_user_categories ON entries(user_id) WHERE 'inbox' = ANY(categories);
CREATE INDEX idx_entries_completed ON entries(user_id, is_completed) WHERE 'task' = ANY(categories);

-- 6. Add NOT NULL constraint (after data migration)
ALTER TABLE entries ALTER COLUMN categories SET NOT NULL;

-- 7. Add input_type 'pdf' if not already present
-- (the enum may not include 'pdf' from the original schema)
ALTER TYPE entry_input_type ADD VALUE IF NOT EXISTS 'pdf';

-- 8. Add reminders column if not exists
ALTER TABLE entries ADD COLUMN IF NOT EXISTS reminders TEXT[] DEFAULT '{}';
