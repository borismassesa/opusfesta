-- Align vendor_bookings RLS with the vendor_memberships RBAC that inquiries
-- already uses (056_vendor_portal_membership_onboarding.sql), fixing the
-- owner-only asymmetry: a manager/staff vendor account could act on
-- inquiries but silently saw zero bookings.
--
-- Staff are deliberately read-only here — bookings carry deposits and
-- contract state, so only owner/manager may create or modify them.

DROP POLICY IF EXISTS "vendors_select_own_bookings" ON vendor_bookings;
CREATE POLICY "vendors_select_own_bookings" ON vendor_bookings
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[])
  );

DROP POLICY IF EXISTS "vendors_insert_own_bookings" ON vendor_bookings;
CREATE POLICY "vendors_insert_own_bookings" ON vendor_bookings
  FOR INSERT
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
  );

DROP POLICY IF EXISTS "vendors_update_own_bookings" ON vendor_bookings;
CREATE POLICY "vendors_update_own_bookings" ON vendor_bookings
  FOR UPDATE
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
  )
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
  );
