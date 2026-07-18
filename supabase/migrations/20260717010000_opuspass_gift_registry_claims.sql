-- OpusPass gift registry — quantity-aware claiming.
--
-- gift_registry_items.claimed_by_name/claimed_at (single claimant) stays as
-- the fast path for the common quantity_requested = 1 case — unchanged, zero
-- risk to the existing single-claim flows (dashboard "mark as received",
-- public claim modal). For items where the couple is asking for more than
-- one (quantity_requested > 1), each unit can be claimed by a DIFFERENT
-- guest — this table holds one row per claimed unit. A gift's total claimed
-- count is: `claimed_by_name IS NOT NULL ? 1 : 0` when quantity_requested <=
-- 1, else `count(*) FROM gift_registry_claims WHERE item_id = ...`.

CREATE TABLE IF NOT EXISTS gift_registry_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES gift_registry_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_registry_claims_item_id ON gift_registry_claims(item_id);
CREATE INDEX IF NOT EXISTS idx_gift_registry_claims_user_id ON gift_registry_claims(user_id);

-- RLS: owner-only. Public claims go through claimGiftRegistryItem in
-- apps/opus_pass/src/lib/dashboard/actions.ts (service-role client, scoped
-- by resolving the couple from the public slug first) — same pattern as
-- gift_registry_items itself.
ALTER TABLE gift_registry_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gift_registry_claims_owner ON gift_registry_claims;
CREATE POLICY gift_registry_claims_owner ON gift_registry_claims
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

NOTIFY pgrst, 'reload schema';
