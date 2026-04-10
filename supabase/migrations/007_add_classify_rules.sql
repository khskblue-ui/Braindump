-- User custom classification rules table
-- Allows users to define "keyword → category + context" rules
CREATE TABLE IF NOT EXISTS user_classify_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  category TEXT NOT NULL,
  context TEXT DEFAULT NULL,  -- 'personal' or 'work' (for task/schedule only)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rules_user ON user_classify_rules(user_id);

ALTER TABLE user_classify_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rules"
  ON user_classify_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own rules"
  ON user_classify_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own rules"
  ON user_classify_rules FOR DELETE USING (auth.uid() = user_id);
