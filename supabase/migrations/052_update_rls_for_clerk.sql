-- Migration 052: Update ALL RLS policies to use requesting_user_id() for Clerk integration
-- This replaces every auth.uid() reference with requesting_user_id()
-- which resolves Clerk JWT 'sub' claim to existing UUID-based user IDs

-- ============================================================================
-- TABLE: users (from 001, 024, 037)
-- ============================================================================

-- 001: Users can view their own data
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (requesting_user_id() = id);

-- 001: Users can update their own data
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (requesting_user_id() = id);

-- 037: Users can insert their own record
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (requesting_user_id() = id);

-- 024: Vendors can view users in their message threads
DROP POLICY IF EXISTS "Vendors can view users in their message threads" ON users;
CREATE POLICY "Vendors can view users in their message threads" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      JOIN vendors ON vendors.id = message_threads.vendor_id
      WHERE message_threads.user_id = users.id
      AND vendors.user_id = requesting_user_id()
    )
  );

-- 024: Users can view vendors in their message threads
DROP POLICY IF EXISTS "Users can view vendors in their message threads" ON users;
CREATE POLICY "Users can view vendors in their message threads" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      JOIN vendors ON vendors.user_id = users.id
      WHERE message_threads.user_id = requesting_user_id()
      AND message_threads.vendor_id = vendors.id
    )
  );

-- ============================================================================
-- TABLE: vendors (from 001)
-- ============================================================================

DROP POLICY IF EXISTS "Vendors can insert their own profile" ON vendors;
CREATE POLICY "Vendors can insert their own profile" ON vendors
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Vendors can update their own profile" ON vendors;
CREATE POLICY "Vendors can update their own profile" ON vendors
  FOR UPDATE USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Vendors can delete their own profile" ON vendors;
CREATE POLICY "Vendors can delete their own profile" ON vendors
  FOR DELETE USING (requesting_user_id() = user_id);

-- ============================================================================
-- TABLE: portfolio (from 001)
-- ============================================================================

DROP POLICY IF EXISTS "Vendors can manage their own portfolio" ON portfolio;
CREATE POLICY "Vendors can manage their own portfolio" ON portfolio
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = portfolio.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

-- ============================================================================
-- TABLE: inquiries (from 001)
-- ============================================================================

DROP POLICY IF EXISTS "Vendors can view their inquiries" ON inquiries;
CREATE POLICY "Vendors can view their inquiries" ON inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = inquiries.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

DROP POLICY IF EXISTS "Users can view their own inquiries" ON inquiries;
CREATE POLICY "Users can view their own inquiries" ON inquiries
  FOR SELECT USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Vendors can update their inquiries" ON inquiries;
CREATE POLICY "Vendors can update their inquiries" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = inquiries.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

-- ============================================================================
-- TABLE: saved_vendors (from 001)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their saved vendors" ON saved_vendors;
CREATE POLICY "Users can view their saved vendors" ON saved_vendors
  FOR SELECT USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Users can save vendors" ON saved_vendors;
CREATE POLICY "Users can save vendors" ON saved_vendors
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Users can update their saved vendors" ON saved_vendors;
CREATE POLICY "Users can update their saved vendors" ON saved_vendors
  FOR UPDATE USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Users can delete their saved vendors" ON saved_vendors;
CREATE POLICY "Users can delete their saved vendors" ON saved_vendors
  FOR DELETE USING (requesting_user_id() = user_id);

-- ============================================================================
-- TABLE: reviews (from 002, 010, 011)
-- ============================================================================

-- 010: Anyone can view approved reviews (or own reviews, or vendor's reviews)
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT
  USING (
    moderation_status = 'approved'
    OR requesting_user_id() = user_id
    OR EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = reviews.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

-- 010: Admins can view all reviews
DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
CREATE POLICY "Admins can view all reviews" ON reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- 011: Authenticated users can create reviews (with booking verification + no duplicates)
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT
  WITH CHECK (
    requesting_user_id() = user_id
    AND can_user_review_vendor(requesting_user_id(), vendor_id)
    AND check_no_duplicate_review(requesting_user_id(), vendor_id)
  );

-- 002: Users can update own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (requesting_user_id() = user_id);

-- 002: Users can delete own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (requesting_user_id() = user_id);

-- 002: Vendors can respond to their reviews
DROP POLICY IF EXISTS "Vendors can respond to their reviews" ON reviews;
CREATE POLICY "Vendors can respond to their reviews" ON reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = reviews.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

-- 010: Admins can moderate reviews
DROP POLICY IF EXISTS "Admins can moderate reviews" ON reviews;
CREATE POLICY "Admins can moderate reviews" ON reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: invoices (from 012)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Vendors can view their invoices" ON invoices;
CREATE POLICY "Vendors can view their invoices" ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = invoices.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

DROP POLICY IF EXISTS "Vendors can create invoices" ON invoices;
CREATE POLICY "Vendors can create invoices" ON invoices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = invoices.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

DROP POLICY IF EXISTS "Vendors can update their invoices" ON invoices;
CREATE POLICY "Vendors can update their invoices" ON invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = invoices.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: payments (from 012)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Vendors can view payments for their invoices" ON payments;
CREATE POLICY "Vendors can view payments for their invoices" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payments.invoice_id
      AND EXISTS (
        SELECT 1 FROM vendors
        WHERE vendors.id = invoices.vendor_id
        AND vendors.user_id = requesting_user_id()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: payment_methods (from 012)
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own payment methods" ON payment_methods;
CREATE POLICY "Users can manage their own payment methods" ON payment_methods
  FOR ALL
  USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

-- ============================================================================
-- TABLE: payouts (from 012)
-- ============================================================================

DROP POLICY IF EXISTS "Vendors can view their own payouts" ON payouts;
CREATE POLICY "Vendors can view their own payouts" ON payouts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = payouts.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

DROP POLICY IF EXISTS "Admins can view all payouts" ON payouts;
CREATE POLICY "Admins can view all payouts" ON payouts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: platform_revenue (from 013)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view platform revenue" ON platform_revenue;
CREATE POLICY "Admins can view platform revenue" ON platform_revenue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: vendor_revenue (from 013)
-- ============================================================================

DROP POLICY IF EXISTS "Vendors can view their own revenue" ON vendor_revenue;
CREATE POLICY "Vendors can view their own revenue" ON vendor_revenue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_revenue.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

DROP POLICY IF EXISTS "Admins can view all vendor revenue" ON vendor_revenue;
CREATE POLICY "Admins can view all vendor revenue" ON vendor_revenue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: payment_receipts (from 014)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own receipts" ON payment_receipts;
CREATE POLICY "Users can view their own receipts" ON payment_receipts
  FOR SELECT USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Vendors can view receipts for their invoices" ON payment_receipts;
CREATE POLICY "Vendors can view receipts for their invoices" ON payment_receipts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = payment_receipts.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

DROP POLICY IF EXISTS "Users can create receipts" ON payment_receipts;
CREATE POLICY "Users can create receipts" ON payment_receipts
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Vendors and admins can verify receipts" ON payment_receipts;
CREATE POLICY "Vendors and admins can verify receipts" ON payment_receipts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = payment_receipts.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all receipts" ON payment_receipts;
CREATE POLICY "Admins can view all receipts" ON payment_receipts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: escrow_holds (from 015)
-- ============================================================================

DROP POLICY IF EXISTS "Vendors can view their escrow holds" ON escrow_holds;
CREATE POLICY "Vendors can view their escrow holds" ON escrow_holds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = escrow_holds.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

DROP POLICY IF EXISTS "Users can view their escrow holds" ON escrow_holds;
CREATE POLICY "Users can view their escrow holds" ON escrow_holds
  FOR SELECT USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Admins can view all escrow holds" ON escrow_holds;
CREATE POLICY "Admins can view all escrow holds" ON escrow_holds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: platform_mobile_money_accounts (from 017)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage mobile money accounts" ON platform_mobile_money_accounts;
CREATE POLICY "Admins can manage mobile money accounts" ON platform_mobile_money_accounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: vendor_reports (from 019)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own reports" ON vendor_reports;
CREATE POLICY "Users can view their own reports" ON vendor_reports
  FOR SELECT USING (requesting_user_id() = reported_by);

DROP POLICY IF EXISTS "Admins can view all vendor reports" ON vendor_reports;
CREATE POLICY "Admins can view all vendor reports" ON vendor_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update vendor reports" ON vendor_reports;
CREATE POLICY "Admins can update vendor reports" ON vendor_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: message_threads (from 022)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own threads" ON message_threads;
CREATE POLICY "Users can view their own threads" ON message_threads
  FOR SELECT USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS "Vendors can view threads for their vendor" ON message_threads;
CREATE POLICY "Vendors can view threads for their vendor" ON message_threads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = message_threads.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

DROP POLICY IF EXISTS "Users can create threads" ON message_threads;
CREATE POLICY "Users can create threads" ON message_threads
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

-- ============================================================================
-- TABLE: messages (from 022)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
CREATE POLICY "Users can view messages in their threads" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
      AND (
        message_threads.user_id = requesting_user_id()
        OR EXISTS (
          SELECT 1 FROM vendors
          WHERE vendors.id = message_threads.vendor_id
          AND vendors.user_id = requesting_user_id()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
CREATE POLICY "Users can send messages in their threads" ON messages
  FOR INSERT
  WITH CHECK (
    requesting_user_id() = sender_id
    AND EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
      AND (
        message_threads.user_id = requesting_user_id()
        OR EXISTS (
          SELECT 1 FROM vendors
          WHERE vendors.id = message_threads.vendor_id
          AND vendors.user_id = requesting_user_id()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
CREATE POLICY "Users can update messages in their threads" ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
      AND (
        message_threads.user_id = requesting_user_id()
        OR EXISTS (
          SELECT 1 FROM vendors
          WHERE vendors.id = message_threads.vendor_id
          AND vendors.user_id = requesting_user_id()
        )
      )
    )
  );

-- ============================================================================
-- TABLE: job_postings (from 027)
-- ============================================================================

DROP POLICY IF EXISTS "admins manage job postings" ON job_postings;
CREATE POLICY "admins manage job postings" ON job_postings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: job_applications (from 027, 036)
-- ============================================================================

DROP POLICY IF EXISTS "admins read applications" ON job_applications;
CREATE POLICY "admins read applications" ON job_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins update applications" ON job_applications;
CREATE POLICY "admins update applications" ON job_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- 036: Users can insert their own applications
DROP POLICY IF EXISTS "users insert own applications" ON job_applications;
CREATE POLICY "users insert own applications" ON job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    requesting_user_id() IS NOT NULL
    AND (
      user_id IS NULL OR user_id = requesting_user_id()
    )
  );

-- 036: Users can read their own applications
DROP POLICY IF EXISTS "users read own applications" ON job_applications;
CREATE POLICY "users read own applications" ON job_applications
  FOR SELECT
  TO authenticated
  USING (
    requesting_user_id() IS NOT NULL
    AND user_id = requesting_user_id()
  );

-- 036: Users can update their own draft applications
DROP POLICY IF EXISTS "users update own draft applications" ON job_applications;
CREATE POLICY "users update own draft applications" ON job_applications
  FOR UPDATE
  TO authenticated
  USING (
    requesting_user_id() IS NOT NULL
    AND user_id = requesting_user_id()
    AND is_draft = true
  )
  WITH CHECK (
    requesting_user_id() IS NOT NULL
    AND user_id = requesting_user_id()
    AND is_draft = true
  );

-- ============================================================================
-- TABLE: application_tasks (from 035)
-- ============================================================================

DROP POLICY IF EXISTS "admins manage application tasks" ON application_tasks;
CREATE POLICY "admins manage application tasks" ON application_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: application_activity_log (from 035)
-- ============================================================================

DROP POLICY IF EXISTS "admins read activity logs" ON application_activity_log;
CREATE POLICY "admins read activity logs" ON application_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins insert activity logs" ON application_activity_log;
CREATE POLICY "admins insert activity logs" ON application_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: vendor_views (from 038)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own views" ON vendor_views;
CREATE POLICY "Users can view their own views" ON vendor_views
  FOR SELECT USING (requesting_user_id() = user_id OR user_id IS NULL);

-- ============================================================================
-- TABLE: vendor_availability (from 009)
-- ============================================================================

DROP POLICY IF EXISTS "Vendors can manage their own availability" ON vendor_availability;
CREATE POLICY "Vendors can manage their own availability" ON vendor_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_availability.vendor_id
      AND vendors.user_id = requesting_user_id()
    )
  );

-- ============================================================================
-- TABLE: admin_whitelist (from 040)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view whitelist" ON admin_whitelist;
CREATE POLICY "Admins can view whitelist" ON admin_whitelist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'::user_role
    )
    OR EXISTS (
      SELECT 1 FROM admin_whitelist aw
      WHERE aw.user_id = requesting_user_id()
      AND aw.role = 'owner'
      AND aw.is_active = true
    )
  );

DROP POLICY IF EXISTS "Owners can insert whitelist" ON admin_whitelist;
CREATE POLICY "Owners can insert whitelist" ON admin_whitelist
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'::user_role
    )
    OR EXISTS (
      SELECT 1 FROM admin_whitelist aw
      WHERE aw.user_id = requesting_user_id()
      AND aw.role = 'owner'
      AND aw.is_active = true
    )
  );

DROP POLICY IF EXISTS "Owners can update whitelist" ON admin_whitelist;
CREATE POLICY "Owners can update whitelist" ON admin_whitelist
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'::user_role
    )
    OR EXISTS (
      SELECT 1 FROM admin_whitelist aw
      WHERE aw.user_id = requesting_user_id()
      AND aw.role = 'owner'
      AND aw.is_active = true
    )
  );

DROP POLICY IF EXISTS "Owners can delete whitelist" ON admin_whitelist;
CREATE POLICY "Owners can delete whitelist" ON admin_whitelist
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'::user_role
    )
    OR EXISTS (
      SELECT 1 FROM admin_whitelist aw
      WHERE aw.user_id = requesting_user_id()
      AND aw.role = 'owner'
      AND aw.is_active = true
    )
  );

-- ============================================================================
-- TABLE: employees (from 041)
-- ============================================================================

DROP POLICY IF EXISTS "admins manage employees" ON employees;
CREATE POLICY "admins manage employees" ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- TABLE: verification_codes (from 043) - will be dropped in Phase 3
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own verification codes" ON verification_codes;
CREATE POLICY "Users can view their own verification codes" ON verification_codes
  FOR SELECT USING (requesting_user_id() = user_id);

-- ============================================================================
-- STORAGE: careers bucket (from 028, 031, 039)
-- ============================================================================

-- 039: admins read careers files
DROP POLICY IF EXISTS "admins read careers files" ON storage.objects;
CREATE POLICY "admins read careers files" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- 039: admins delete careers files
DROP POLICY IF EXISTS "admins delete careers files" ON storage.objects;
CREATE POLICY "admins delete careers files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- 031: admins insert careers
DROP POLICY IF EXISTS "admins insert careers" ON storage.objects;
CREATE POLICY "admins insert careers" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- 031: admins update careers
DROP POLICY IF EXISTS "admins update careers" ON storage.objects;
CREATE POLICY "admins update careers" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- STORAGE: employees bucket (from 042)
-- ============================================================================

DROP POLICY IF EXISTS "admins insert employee documents" ON storage.objects;
CREATE POLICY "admins insert employee documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins read employee documents" ON storage.objects;
CREATE POLICY "admins read employee documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins update employee documents" ON storage.objects;
CREATE POLICY "admins update employee documents" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins delete employee documents" ON storage.objects;
CREATE POLICY "admins delete employee documents" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = requesting_user_id()
      AND users.role = 'admin'
    )
  );
