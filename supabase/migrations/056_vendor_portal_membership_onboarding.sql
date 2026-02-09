-- Migration 056: Vendor portal memberships + onboarding state + RBAC policy upgrades

-- 0) Compatibility: ensure requesting_user_id() exists.
-- This supports both Clerk JWT (`users.clerk_id`) and native Supabase auth (`auth.uid()`).
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_sub TEXT;
  has_clerk_id BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'clerk_id'
  ) INTO has_clerk_id;

  IF has_clerk_id THEN
    v_sub := auth.jwt()->>'sub';
    IF v_sub IS NOT NULL THEN
      SELECT id
      INTO v_user_id
      FROM public.users
      WHERE clerk_id = v_sub
      LIMIT 1;
    END IF;
  END IF;

  IF v_user_id IS NULL THEN
    v_user_id := auth.uid();
  END IF;

  RETURN v_user_id;
END;
$$;

-- 1) Enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_onboarding_status') THEN
    CREATE TYPE vendor_onboarding_status AS ENUM (
      'invited',
      'in_progress',
      'pending_review',
      'active',
      'suspended'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_member_role') THEN
    CREATE TYPE vendor_member_role AS ENUM ('owner', 'manager', 'staff');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_member_status') THEN
    CREATE TYPE vendor_member_status AS ENUM ('invited', 'active', 'disabled');
  END IF;
END;
$$;

-- 2) Vendors onboarding fields
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS onboarding_status vendor_onboarding_status NOT NULL DEFAULT 'in_progress',
  ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_vendors_onboarding_status ON vendors(onboarding_status);

-- Existing vendors are considered active at migration time.
UPDATE vendors
SET
  onboarding_status = 'active',
  onboarding_started_at = COALESCE(onboarding_started_at, created_at),
  onboarding_completed_at = COALESCE(onboarding_completed_at, updated_at)
WHERE onboarding_status = 'in_progress';

-- 3) Vendor team memberships
CREATE TABLE IF NOT EXISTS vendor_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role vendor_member_role NOT NULL DEFAULT 'staff',
  status vendor_member_status NOT NULL DEFAULT 'active',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vendor_memberships_vendor_id ON vendor_memberships(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_memberships_user_id ON vendor_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_memberships_status ON vendor_memberships(status);
CREATE INDEX IF NOT EXISTS idx_vendor_memberships_role ON vendor_memberships(role);

DROP TRIGGER IF EXISTS update_vendor_memberships_updated_at ON vendor_memberships;
CREATE TRIGGER update_vendor_memberships_updated_at
  BEFORE UPDATE ON vendor_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4) Backfill owners from vendors.user_id
INSERT INTO vendor_memberships (vendor_id, user_id, role, status, created_at, updated_at)
SELECT v.id, v.user_id, 'owner', 'active', COALESCE(v.created_at, now()), now()
FROM vendors v
ON CONFLICT (vendor_id, user_id)
DO UPDATE SET role = 'owner', status = 'active', updated_at = now();

-- 5) Helper functions
CREATE OR REPLACE FUNCTION is_platform_admin(user_uuid UUID DEFAULT requesting_user_id())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE id = user_uuid
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_vendor_member(
  vendor_uuid UUID,
  allowed_roles vendor_member_role[] DEFAULT ARRAY['owner', 'manager', 'staff']::vendor_member_role[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    requesting_user_id() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM vendor_memberships vm
        WHERE vm.vendor_id = vendor_uuid
          AND vm.user_id = requesting_user_id()
          AND vm.status = 'active'
          AND vm.role = ANY(allowed_roles)
      )
      OR (
        'owner' = ANY(allowed_roles)
        AND EXISTS (
          SELECT 1
          FROM vendors v
          WHERE v.id = vendor_uuid
            AND v.user_id = requesting_user_id()
        )
      )
    );
$$;

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

-- 6) RLS for vendor memberships
ALTER TABLE vendor_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their vendor memberships" ON vendor_memberships;
CREATE POLICY "Users can view their vendor memberships" ON vendor_memberships
  FOR SELECT
  USING (
    requesting_user_id() = user_id
    OR is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[])
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "Owners can manage vendor memberships" ON vendor_memberships;
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

-- 7) Upgrade key vendor policies from owner-only to membership-aware RBAC
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

DROP POLICY IF EXISTS "Vendors can manage their own portfolio" ON portfolio;
CREATE POLICY "Vendors can manage their own portfolio" ON portfolio
  FOR ALL
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]))
  WITH CHECK (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]));

DROP POLICY IF EXISTS "Vendors can view their inquiries" ON inquiries;
CREATE POLICY "Vendors can view their inquiries" ON inquiries
  FOR SELECT
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[]));

DROP POLICY IF EXISTS "Vendors can update their inquiries" ON inquiries;
CREATE POLICY "Vendors can update their inquiries" ON inquiries
  FOR UPDATE
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[]))
  WITH CHECK (is_vendor_member(vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[]));

DROP POLICY IF EXISTS "Vendors can view threads for their vendor" ON message_threads;
CREATE POLICY "Vendors can view threads for their vendor" ON message_threads
  FOR SELECT
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager', 'staff']::vendor_member_role[]));

DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
CREATE POLICY "Users can view messages in their threads" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM message_threads
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

DROP POLICY IF EXISTS "Users can send messages in their threads" ON messages;
CREATE POLICY "Users can send messages in their threads" ON messages
  FOR INSERT
  WITH CHECK (
    requesting_user_id() = sender_id
    AND EXISTS (
      SELECT 1
      FROM message_threads
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

DROP POLICY IF EXISTS "Users can update messages in their threads" ON messages;
CREATE POLICY "Users can update messages in their threads" ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM message_threads
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
      SELECT 1
      FROM message_threads
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

DROP POLICY IF EXISTS "Vendors can manage their own availability" ON vendor_availability;
CREATE POLICY "Vendors can manage their own availability" ON vendor_availability
  FOR ALL
  USING (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]))
  WITH CHECK (is_vendor_member(vendor_id, ARRAY['owner', 'manager']::vendor_member_role[]));
