-- Invitations for adding manager/staff members to a vendor account.
-- Modeled on workforce_invitations (20260514213347), but delivery is an
-- 8-char invite code shared out-of-band and typed into the mobile app —
-- not an emailed magic link — since mobile has no universal-links config.
-- Only the sha256 of the code is stored; the plaintext is returned once at
-- creation by the vendor-team-invite edge function and never persisted.

CREATE TABLE IF NOT EXISTS vendor_membership_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        vendor_member_role NOT NULL CHECK (role IN ('manager', 'staff')),
  code_hash   TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_vendor_membership_invitations_vendor
  ON vendor_membership_invitations (vendor_id);

-- One live invite per (vendor, email) at a time.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_vendor_membership_invitations_pending
  ON vendor_membership_invitations (vendor_id, email)
  WHERE status = 'pending';

ALTER TABLE vendor_membership_invitations ENABLE ROW LEVEL SECURITY;

-- Owners/managers manage their own vendor's invitations. The redeem path
-- (matching a code to a row and flipping it accepted) runs service-role in
-- the vendor-team-invite edge function, which bypasses RLS.
CREATE POLICY "vendor_admins_select_invitations" ON vendor_membership_invitations
  FOR SELECT
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]));

CREATE POLICY "vendor_admins_insert_invitations" ON vendor_membership_invitations
  FOR INSERT
  WITH CHECK (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]));

CREATE POLICY "vendor_admins_update_invitations" ON vendor_membership_invitations
  FOR UPDATE
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]))
  WITH CHECK (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]));

CREATE POLICY "service_role_all_vendor_membership_invitations" ON vendor_membership_invitations
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- The team roster joins users for member names/emails, but users SELECT RLS
-- only covers own-row and message-thread counterparties — teammates would
-- come back null. Let members of the same vendor see each other.
DROP POLICY IF EXISTS "Vendor members can view their teammates" ON users;
CREATE POLICY "Vendor members can view their teammates" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendor_memberships teammate
      WHERE teammate.user_id = users.id
        AND teammate.status = 'active'
        AND is_vendor_member(teammate.vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[])
    )
  );
