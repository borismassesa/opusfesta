-- OpusPass gift registry — shop/purchase-location info + guest contact
-- capture, so the couple can point guests at exactly where (physically) to
-- buy a gift in Tanzania, and so a claim can be receipted back to both the
-- guest and the couple via email/WhatsApp.

ALTER TABLE gift_registry_items
  ADD COLUMN IF NOT EXISTS shop_name TEXT,
  ADD COLUMN IF NOT EXISTS shop_location TEXT,
  ADD COLUMN IF NOT EXISTS shop_contact TEXT,
  ADD COLUMN IF NOT EXISTS claimed_by_phone TEXT,
  ADD COLUMN IF NOT EXISTS claimed_by_email TEXT;

COMMENT ON COLUMN gift_registry_items.shop_name IS 'Physical shop/vendor where this gift can be bought (Tanzania-first: most gifts are bought in person, not shipped).';
COMMENT ON COLUMN gift_registry_items.shop_location IS 'Free-text address/area for the shop above.';
COMMENT ON COLUMN gift_registry_items.shop_contact IS 'Phone/WhatsApp number for the shop above.';
COMMENT ON COLUMN gift_registry_items.claimed_by_phone IS 'Claiming guest''s phone (for the claim-received message and so the couple can reach them). Only set for quantity_requested <= 1 items — see gift_registry_claims for multi-unit items.';
COMMENT ON COLUMN gift_registry_items.claimed_by_email IS 'Claiming guest''s email, optional.';

-- Multi-unit claims (quantity_requested > 1) get the same contact columns on
-- their own per-claim row.
ALTER TABLE gift_registry_claims
  ADD COLUMN IF NOT EXISTS guest_phone TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT;

COMMENT ON COLUMN gift_registry_claims.guest_phone IS 'Claiming guest''s phone for this unit.';
COMMENT ON COLUMN gift_registry_claims.guest_email IS 'Claiming guest''s email for this unit, optional.';

NOTIFY pgrst, 'reload schema';
