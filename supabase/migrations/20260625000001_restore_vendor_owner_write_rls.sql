-- Restore owner / member write access to `vendors`.
--
-- The live database had drifted to only two policies on `vendors`:
--   * public_read_active_vendors (SELECT, onboarding_status = 'active')
--   * service_role_all_vendors  (ALL, service role only)
-- The owner INSERT/UPDATE/DELETE policies introduced in migration
-- 056_vendor_portal_membership_onboarding.sql were absent. With the Clerk
-- 'supabase' JWT template configured, the vendor portal authenticates as the
-- Clerk user (NOT service_role), so `createClerkSupabaseServerClient()` no
-- longer falls back to the admin client — and every storefront save
-- (profile, business hours, booking policies, availability, package badges)
-- matched 0 rows under RLS and surfaced "Vendor record not found".
--
-- These policies are identical to migration 056: a vendor can write its own
-- row when the requesting user is the vendor's `user_id`, or an owner/manager
-- member. `requesting_user_id()` and `is_vendor_member()` already exist.

DROP POLICY IF EXISTS "Vendors can insert their own profile" ON vendors;
CREATE POLICY "Vendors can insert their own profile" ON vendors
  FOR INSERT
  WITH CHECK (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Vendors can update their own profile" ON vendors;
CREATE POLICY "Vendors can update their own profile" ON vendors
  FOR UPDATE
  USING (
    requesting_user_id() = user_id
    OR is_vendor_member(id, ARRAY['owner', 'manager']::vendor_member_role[])
  )
  WITH CHECK (
    requesting_user_id() = user_id
    OR is_vendor_member(id, ARRAY['owner', 'manager']::vendor_member_role[])
  );

DROP POLICY IF EXISTS "Vendors can delete their own profile" ON vendors;
CREATE POLICY "Vendors can delete their own profile" ON vendors
  FOR DELETE
  USING (
    requesting_user_id() = user_id
    OR is_vendor_member(id, ARRAY['owner']::vendor_member_role[])
  );
