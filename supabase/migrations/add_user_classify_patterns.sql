-- User classification pattern learning table
-- Stores corrections users make to AI classifications for future personalization
CREATE TABLE IF NOT EXISTS user_classify_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES entries(id) ON DELETE SET NULL,
  original_categories TEXT[] NOT NULL,
  corrected_categories TEXT[],
  original_tags TEXT[],
  corrected_tags TEXT[],
  original_priority TEXT,
  corrected_priority TEXT,
  keyword_context TEXT,  -- first 200 chars of raw_text for context
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_patterns_user ON user_classify_patterns(user_id);
CREATE INDEX idx_patterns_user_recent ON user_classify_patterns(user_id, created_at DESC);

ALTER TABLE user_classify_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patterns"
  ON user_classify_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own patterns"
  ON user_classify_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own patterns"
  ON user_classify_patterns FOR DELETE USING (auth.uid() = user_id);
