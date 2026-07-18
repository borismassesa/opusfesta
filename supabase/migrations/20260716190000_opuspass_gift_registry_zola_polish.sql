-- OpusPass gift registry — Zola-inspired manage-registry polish.
--
-- Adds the fields needed to bring the manage-registry UI closer to Zola's
-- patterns (category filter, "Asking for N" quantity context, Most Wanted /
-- Group Gift flags) without building an actual product catalog, cart, or
-- checkout — the registry stays a manual couple-curated wishlist with a
-- single claim per item.

ALTER TABLE gift_registry_items
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS quantity_requested INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS most_wanted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS group_gift BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE gift_registry_items DROP CONSTRAINT IF EXISTS gift_registry_items_quantity_requested_check;
ALTER TABLE gift_registry_items
  ADD CONSTRAINT gift_registry_items_quantity_requested_check CHECK (quantity_requested >= 1);

-- Lets the manage-registry filter bar list only categories actually in use
-- without a full-table scan.
CREATE INDEX IF NOT EXISTS idx_gift_registry_items_user_category
  ON gift_registry_items(user_id, category);

NOTIFY pgrst, 'reload schema';
