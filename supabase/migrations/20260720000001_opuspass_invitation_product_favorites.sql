-- OpusPass Cards — persist liked invitation/card designs per user, synced
-- across devices (replaces the mobile app's local-only AsyncStorage
-- favorites). Mirrors the owner-only RLS pattern from
-- 20260526000005_opus_pass_couple_dashboard.sql.

CREATE TABLE IF NOT EXISTS invitation_product_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Server-computed default so the client never needs to (or can) supply
  -- another user's id — it's always whoever's JWT is on the request.
  user_id UUID NOT NULL DEFAULT requesting_user_id() REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES website_invitations_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_invitation_product_favorites_user_id ON invitation_product_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_invitation_product_favorites_product_id ON invitation_product_favorites(product_id);

ALTER TABLE invitation_product_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitation_product_favorites_owner ON invitation_product_favorites
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);
