-- Restore the owner-membership trigger + backfill from migration
-- 056_vendor_portal_membership_onboarding.sql, which were missing on the live
-- database (the `vendor_memberships` table and `is_vendor_member()` exist, but
-- the trigger that auto-creates an owner row on vendor insert/ownership-change
-- was gone, so no membership rows were being created).
--
-- Owners already write via the `vendors.user_id` RLS path (restored in
-- 20260625000001), so this is not required for owner writes — but it makes the
-- membership-aware RBAC (managers/staff, and the membership-based policies on
-- payouts/portfolio/etc.) work as designed.

CREATE OR REPLACE FUNCTION ensure_vendor_owner_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO vendor_memberships (vendor_id, user_id, role, status, created_at, updated_at)
  VALUES (NEW.id, NEW.user_id, 'owner', 'active', COALESCE(NEW.created_at, now()), now())
  ON CONFLICT (vendor_id, user_id)
  DO UPDATE SET role = 'owner', status = 'active', updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_vendor_owner_membership_trigger ON vendors;
CREATE TRIGGER ensure_vendor_owner_membership_trigger
  AFTER INSERT OR UPDATE OF user_id ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION ensure_vendor_owner_membership();

-- Backfill an owner membership for every existing vendor that has an owner but
-- no membership row yet.
INSERT INTO vendor_memberships (vendor_id, user_id, role, status, created_at, updated_at)
SELECT v.id, v.user_id, 'owner', 'active', COALESCE(v.created_at, now()), now()
FROM vendors v
WHERE v.user_id IS NOT NULL
ON CONFLICT (vendor_id, user_id)
DO UPDATE SET role = 'owner', status = 'active', updated_at = now();
