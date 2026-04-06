-- Add sort_order for manual card positioning
ALTER TABLE entries ADD COLUMN IF NOT EXISTS sort_order INTEGER;
CREATE INDEX IF NOT EXISTS idx_entries_sort_order ON entries(user_id, sort_order) WHERE sort_order IS NOT NULL;
