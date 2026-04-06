CREATE TABLE entry_sort_orders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id   UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category   TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, user_id, category)
);

CREATE INDEX idx_entry_sort_orders_user_cat ON entry_sort_orders(user_id, category, sort_order);
CREATE INDEX idx_entry_sort_orders_entry ON entry_sort_orders(entry_id);

ALTER TABLE entry_sort_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sort orders" ON entry_sort_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sort orders" ON entry_sort_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sort orders" ON entry_sort_orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sort orders" ON entry_sort_orders FOR DELETE USING (auth.uid() = user_id);
