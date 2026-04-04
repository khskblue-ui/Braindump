-- BrainDump Database Schema
-- Run this in Supabase SQL Editor

-- 1. Enums
CREATE TYPE entry_category AS ENUM ('task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox');
CREATE TYPE entry_input_type AS ENUM ('text', 'image', 'mixed', 'pdf');
CREATE TYPE entry_priority AS ENUM ('high', 'medium', 'low');

-- 2. Entries table
CREATE TABLE entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text            TEXT,
  image_url           TEXT,
  image_thumbnail_url TEXT,
  extracted_text      TEXT,
  categories          TEXT[] NOT NULL DEFAULT '{inbox}',
  tags                TEXT[] DEFAULT '{}',
  topic               TEXT,
  summary             TEXT,
  due_date            TIMESTAMPTZ,
  priority            entry_priority,
  is_completed        BOOLEAN DEFAULT FALSE,
  reminders           TEXT[] DEFAULT '{}',
  input_type          entry_input_type NOT NULL DEFAULT 'text',
  ai_metadata         JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_categories ON entries USING GIN(categories);
CREATE INDEX idx_entries_topic ON entries(user_id, topic) WHERE topic IS NOT NULL;
CREATE INDEX idx_entries_created_at ON entries(user_id, created_at DESC);
CREATE INDEX idx_entries_tags ON entries USING GIN(tags);
CREATE INDEX idx_entries_completed ON entries(user_id, is_completed) WHERE 'task' = ANY(categories);

-- 4. Full-text search (simple config for Korean support)
ALTER TABLE entries ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(raw_text, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(extracted_text, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'C')
  ) STORED;
CREATE INDEX idx_entries_fts ON entries USING GIN(fts);

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. RLS for entries
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Custom categories table
CREATE TABLE custom_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  icon       TEXT DEFAULT '📁',
  color      TEXT DEFAULT '#888888',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON custom_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON custom_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON custom_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON custom_categories FOR DELETE
  USING (auth.uid() = user_id);

-- 9. Soft delete
ALTER TABLE entries ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX idx_entries_deleted_at ON entries(user_id, deleted_at) WHERE deleted_at IS NOT NULL;

-- 10. User settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_purge_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. Storage bucket for entry images
-- Run in Supabase Dashboard > Storage > Create bucket:
--   Name: entry-images
--   Public: false
--   File size limit: 5MB
--   Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage RLS policies (run in SQL editor):
CREATE POLICY "Authenticated users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'entry-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'entry-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'entry-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
