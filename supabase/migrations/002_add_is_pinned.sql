-- Add is_pinned column for pin/bookmark feature
ALTER TABLE entries ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Index for efficient pinned-first sorting
CREATE INDEX IF NOT EXISTS idx_entries_pinned ON entries(user_id, is_pinned) WHERE is_pinned = TRUE;
