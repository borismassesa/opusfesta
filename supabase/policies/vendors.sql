-- =============================================================================
-- VENDOR-SCOPED RLS CONTRACT — READ-ONLY MIRROR
-- =============================================================================
-- This file documents the *current effective* row-level security policies for
-- every table that the vendors_portal app reads or writes. It is the contract
-- a developer should consult before adding a new vendor-scoped Supabase query.
--
-- DO NOT APPLY THIS FILE.
--   The authoritative source of truth is `supabase/migrations/`. This file is
--   a hand-curated mirror, kept in sync by review. If a migration changes one
--   of these policies, this file must be updated in the same PR.
--
-- Source migrations reflected here:
--   001_initial_schema.sql                     — initial table + RLS enable
--   002_reviews_table.sql                      — reviews
--   010_reviews_moderation.sql                 — review moderation states
--   011_fix_review_policy.sql                  — review insert + duplicate guards
--   019_vendor_reports.sql                     — vendor abuse reports
--   022_messaging_system.sql                   — message_threads, messages
--   024_fix_users_rls_for_messages.sql         — user visibility through threads
--   038_add_vendor_views_tracking.sql          — vendor_views analytics
--   040_create_admin_whitelist.sql             — admin allowlist
--   052_update_rls_for_clerk.sql               — Clerk JWT integration
--                                                (replaces auth.uid() with
--                                                 requesting_user_id())
--   056_vendor_portal_membership_onboarding.sql — vendor_memberships RBAC
--                                                (introduces is_vendor_member,
--                                                 is_platform_admin)
--   058_vendor_membership_finance_policies.sql — finance tables on RBAC
--
-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================
-- Defined in 056. Two helpers underpin every vendor-scoped policy below.
--
--   requesting_user_id() RETURNS uuid
--     Resolves the calling user's `public.users.id`:
--       1. If `users.clerk_id` column exists, looks up by `auth.jwt()->>'sub'`.
--       2. Falls back to `auth.uid()` (native Supabase auth).
--     Returns NULL when no authenticated user.
--
--   is_vendor_member(vendor_uuid uuid, allowed_roles vendor_member_role[])
--     Returns TRUE iff the calling user has an *active* vendor_memberships row
--     for `vendor_uuid` with role in `allowed_roles`. Falls back to legacy
--     `vendors.user_id` ownership when 'owner' is in allowed_roles (this
--     handles the pre-membership backfill window).
--     Default allowed_roles: ARRAY['owner', 'manager', 'staff'].
--
--   is_platform_admin(user_uuid uuid DEFAULT requesting_user_id())
--     Returns TRUE iff the user has `users.role = 'admin'`.
--
-- vendor_member_role enum: 'owner' | 'manager' | 'staff'
-- vendor_member_status enum: 'invited' | 'active' | 'disabled'
--   Note: is_vendor_member() checks status = 'active' implicitly.
--
-- =============================================================================
-- VENDOR-SCOPED TABLES
-- =============================================================================
--
-- Convention in the table headers below:
--   READ   — what the vendor team can SELECT
--   WRITE  — what the vendor team can INSERT/UPDATE/DELETE
--   ROLES  — which vendor_member_role values are allowed
--
-- =============================================================================
-- TABLE: vendors                          [001 + 052 + 056]
-- =============================================================================
-- READ:  Anyone (public listing) — "Anyone can view published vendors" (001)
-- WRITE: INSERT — owner only (requesting_user_id() = user_id)            [052]
--        UPDATE — owner OR vendor_memberships.role IN (owner, manager)   [056]
--        DELETE — owner OR vendor_memberships.role = owner               [056]

CREATE POLICY "Anyone can view published vendors" ON vendors
  FOR SELECT USING (true);

CREATE POLICY "Vendors can insert their own profile" ON vendors
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

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

CREATE POLICY "Vendors can delete their own profile" ON vendors
  FOR DELETE
  USING (
    requesting_user_id() = user_id
    OR is_vendor_member(id, ARRAY['owner']::vendor_member_role[])
  );

-- =============================================================================
-- TABLE: vendor_memberships                                            [056]
-- =============================================================================
-- READ:  Self (own membership rows) OR owner/manager of the vendor OR admin
-- WRITE: Owner only OR admin

CREATE POLICY "Users can view their vendor memberships" ON vendor_memberships
  FOR SELECT
  USING (
    requesting_user_id() = user_id
    OR is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

CREATE POLICY "Owners can manage vendor memberships" ON vendor_memberships
  FOR ALL
  USING (
    is_vendor_member(vendor_id, ARRAY['owner']::vendor_member_role[])
    OR is_platform_admin()
  )
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner']::vendor_member_role[])
    OR is_platform_admin()
  );

-- =============================================================================
-- TABLE: portfolio                                          [001 + 056]
-- =============================================================================
-- READ:  Anyone — "Anyone can view portfolio items" (001)
-- WRITE: owner OR manager

CREATE POLICY "Anyone can view portfolio items" ON portfolio
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own portfolio" ON portfolio
  FOR ALL
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]))
  WITH CHECK (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]));

-- =============================================================================
-- TABLE: inquiries                                  [001 + 052 + 056]
-- =============================================================================
-- READ:  Customer (own inquiry by user_id) OR owner/manager/staff of vendor
-- WRITE: INSERT — anyone (anonymous lead capture is allowed)             [001]
--        UPDATE — owner/manager/staff (status, vendor_response)          [056]

CREATE POLICY "Anyone can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own inquiries" ON inquiries
  FOR SELECT USING (requesting_user_id() = user_id);

CREATE POLICY "Vendors can view their inquiries" ON inquiries
  FOR SELECT
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[]));

CREATE POLICY "Vendors can update their inquiries" ON inquiries
  FOR UPDATE
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[]))
  WITH CHECK (is_vendor_member(vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[]));

-- =============================================================================
-- TABLE: reviews                                [002 + 010 + 011 + 052]
-- =============================================================================
-- READ:  Approved reviews public; reviewer can see own; vendor can see own; admin all
-- WRITE: INSERT — authenticated, must have booked the vendor + no duplicate
--        UPDATE — author OR vendor (response) OR admin (moderation)
--        DELETE — author

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

CREATE POLICY "Admins can view all reviews" ON reviews
  FOR SELECT USING (is_platform_admin());

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT
  WITH CHECK (
    requesting_user_id() = user_id
    AND can_user_review_vendor(requesting_user_id(), vendor_id)
    AND check_no_duplicate_review(requesting_user_id(), vendor_id)
  );

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (requesting_user_id() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (requesting_user_id() = user_id);

CREATE POLICY "Vendors can respond to their reviews" ON reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = reviews.vendor_id
        AND vendors.user_id = requesting_user_id()
    )
  );
-- ⚠ DRIFT NOTE: this still uses legacy vendors.user_id check, not is_vendor_member.
--   When updating, prefer the membership-aware form for new policies.

CREATE POLICY "Admins can moderate reviews" ON reviews
  FOR UPDATE USING (is_platform_admin());

-- =============================================================================
-- TABLE: vendor_availability                            [009 + 056]
-- =============================================================================
-- READ:  Same as WRITE (no public read policy currently)
-- WRITE: owner OR manager

CREATE POLICY "Vendors can manage their own availability" ON vendor_availability
  FOR ALL
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]))
  WITH CHECK (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]));

-- =============================================================================
-- TABLE: vendor_reports                                       [019 + 052]
-- =============================================================================
-- Vendor portal CANNOT read reports filed against them — admin only.
-- Reporters can see their own filings.

CREATE POLICY "Users can create reports" ON vendor_reports
  FOR INSERT WITH CHECK (requesting_user_id() = reported_by);

CREATE POLICY "Users can view their own reports" ON vendor_reports
  FOR SELECT USING (requesting_user_id() = reported_by);

CREATE POLICY "Admins can view all vendor reports" ON vendor_reports
  FOR SELECT USING (is_platform_admin());

CREATE POLICY "Admins can update vendor reports" ON vendor_reports
  FOR UPDATE USING (is_platform_admin());

-- =============================================================================
-- TABLE: vendor_views                                         [038 + 052]
-- =============================================================================
-- Anonymous-friendly tracking; users see their own rows.
-- ⚠ NOTE: there is currently NO vendor-side SELECT policy — vendors can't
--   directly query their own analytics rows under RLS. Aggregations must go
--   through a service-role view or RPC. Plan needed before insights page wires.

CREATE POLICY "Users can view their own views" ON vendor_views
  FOR SELECT USING (requesting_user_id() = user_id OR user_id IS NULL);

-- =============================================================================
-- TABLE: message_threads                                      [022 + 056]
-- =============================================================================
-- READ:  Customer (own threads) OR owner/manager/staff of vendor
-- WRITE: INSERT — customer side only (requesting_user_id() = user_id)

CREATE POLICY "Users can view their own threads" ON message_threads
  FOR SELECT USING (requesting_user_id() = user_id);

CREATE POLICY "Vendors can view threads for their vendor" ON message_threads
  FOR SELECT
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[]));

CREATE POLICY "Users can create threads" ON message_threads
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

-- =============================================================================
-- TABLE: messages                                             [022 + 056]
-- =============================================================================
-- READ:   Either party (customer = thread owner OR vendor team member)
-- INSERT: Either party, sender_id must match requesting_user_id()
-- UPDATE: Either party

CREATE POLICY "Users can view messages in their threads" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
        AND (
          message_threads.user_id = requesting_user_id()
          OR is_vendor_member(
               message_threads.vendor_id,
               ARRAY['owner', 'manager', 'staff']::vendor_member_role[]
             )
        )
    )
  );

CREATE POLICY "Users can send messages in their threads" ON messages
  FOR INSERT
  WITH CHECK (
    requesting_user_id() = sender_id
    AND EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
        AND (
          message_threads.user_id = requesting_user_id()
          OR is_vendor_member(
               message_threads.vendor_id,
               ARRAY['owner', 'manager', 'staff']::vendor_member_role[]
             )
        )
    )
  );

CREATE POLICY "Users can update messages in their threads" ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
        AND (
          message_threads.user_id = requesting_user_id()
          OR is_vendor_member(
               message_threads.vendor_id,
               ARRAY['owner', 'manager', 'staff']::vendor_member_role[]
             )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
        AND (
          message_threads.user_id = requesting_user_id()
          OR is_vendor_member(
               message_threads.vendor_id,
               ARRAY['owner', 'manager', 'staff']::vendor_member_role[]
             )
        )
    )
  );

-- =============================================================================
-- TABLE: users — visibility through message threads          [024 + 052]
-- =============================================================================
-- The vendor portal needs to display the customer (couple) name on each
-- inquiry/thread. The customer's `users` row is NOT publicly readable, so
-- 024 added cross-visibility through message_threads:

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
-- ⚠ DRIFT NOTE: this uses legacy vendors.user_id, not is_vendor_member().
--   Manager/staff members CANNOT see customer names through this policy.
--   When wiring the inquiries panel for non-owner roles, this will be the
--   first blocker — needs a follow-up migration to upgrade.

-- =============================================================================
-- FINANCE TABLES — owner/manager only                              [058]
-- =============================================================================

CREATE POLICY "Vendors can view their invoices" ON invoices
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

CREATE POLICY "Vendors can create invoices" ON invoices
  FOR INSERT
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

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

CREATE POLICY "Vendors can view payments for their invoices" ON payments
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

CREATE POLICY "Vendors can view their own payouts" ON payouts
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

CREATE POLICY "Vendors can view their own revenue" ON vendor_revenue
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

CREATE POLICY "Vendors can view receipts for their invoices" ON payment_receipts
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

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

CREATE POLICY "Vendors can view their escrow holds" ON escrow_holds
  FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

-- =============================================================================
-- DRIFT TRACKING — known gaps (as of OF-VND-0001)
-- =============================================================================
-- 1. reviews."Vendors can respond to their reviews" still uses vendors.user_id
--    instead of is_vendor_member — manager/staff cannot respond to reviews.
-- 2. users."Vendors can view users in their message threads" still uses
--    vendors.user_id — manager/staff cannot see customer display names on
--    threads they're scoped to. Will block inquiries panel for non-owners.
-- 3. vendor_views has no vendor-side SELECT policy. The insights page CANNOT
--    query this table directly under RLS — needs RPC, view, or new policy.
-- 4. The inquiries.user_id can be NULL (anonymous lead). When the inquiry has
--    no user_id, vendor team can read the inquiry row but cannot join to users
--    to show a display name. The inquiries.name and inquiries.email columns
--    on the inquiry itself should be the display source.
-- =============================================================================
