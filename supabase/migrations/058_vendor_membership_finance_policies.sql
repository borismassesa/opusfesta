-- Migration 058: Make finance and payouts policies membership-aware for vendor portal RBAC

-- Invoices: owner/manager can view + create + update
DROP POLICY IF EXISTS "Vendors can view their invoices" ON invoices;
CREATE POLICY "Vendors can view their invoices" ON invoices
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "Vendors can create invoices" ON invoices;
CREATE POLICY "Vendors can create invoices" ON invoices
  FOR INSERT
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "Vendors can update their invoices" ON invoices;
CREATE POLICY "Vendors can update their invoices" ON invoices
  FOR UPDATE
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  )
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

-- Payments: owner/manager can view payment records for their vendor
DROP POLICY IF EXISTS "Vendors can view payments for their invoices" ON payments;
CREATE POLICY "Vendors can view payments for their invoices" ON payments
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

-- Payouts: owner/manager can view vendor payouts
DROP POLICY IF EXISTS "Vendors can view their own payouts" ON payouts;
CREATE POLICY "Vendors can view their own payouts" ON payouts
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

-- Vendor revenue: owner/manager can view revenue rows
DROP POLICY IF EXISTS "Vendors can view their own revenue" ON vendor_revenue;
CREATE POLICY "Vendors can view their own revenue" ON vendor_revenue
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

-- Payment receipts: owner/manager can view and verify
DROP POLICY IF EXISTS "Vendors can view receipts for their invoices" ON payment_receipts;
CREATE POLICY "Vendors can view receipts for their invoices" ON payment_receipts
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "Vendors and admins can verify receipts" ON payment_receipts;
CREATE POLICY "Vendors and admins can verify receipts" ON payment_receipts
  FOR UPDATE
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  )
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

-- Escrow holds: owner/manager can view escrow balances tied to their vendor
DROP POLICY IF EXISTS "Vendors can view their escrow holds" ON escrow_holds;
CREATE POLICY "Vendors can view their escrow holds" ON escrow_holds
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );
