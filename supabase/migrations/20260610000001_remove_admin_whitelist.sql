-- Phase B: Remove admin_whitelist as auth middleman.
-- Auth now resolves directly from workforce_employees by clerk_user_id.
--
-- GATE: This migration must only run AFTER the clerk_user_id backfill
-- (scripts/backfill-clerk-user-id.ts) has passed — zero null clerk_user_id
-- rows for active dashboard users. Otherwise admins who were provisioned
-- via ad-hoc SQL and never went through the invite flow will lose access.
--
-- Verified pre-cutover query:
--   SELECT email FROM workforce_employees
--   WHERE dashboard_access = true AND clerk_user_id IS NULL;
-- → must return 0 rows before running this migration.

-- 1. Drop the sync trigger (no longer needed — workforce_employees is the
--    authority; admin_whitelist was only a compatibility shim).
DROP TRIGGER IF EXISTS trg_employee_sync_admin_whitelist ON workforce_employees;
DROP FUNCTION IF EXISTS public.sync_employee_to_admin_whitelist();

-- 2. Repoint all three FK columns from admin_whitelist → workforce_employees.
--    (These are the only FKs into admin_whitelist; all must be repointed
--     before the table can be dropped in step 4.)

-- 2a. workforce_invitations.invited_by
ALTER TABLE workforce_invitations
  DROP CONSTRAINT IF EXISTS workforce_invitations_invited_by_fkey;
ALTER TABLE workforce_invitations
  ADD COLUMN IF NOT EXISTS invited_by_employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL;
UPDATE workforce_invitations wi
  SET invited_by_employee_id = we.id
  FROM admin_whitelist aw
  JOIN workforce_employees we ON lower(we.email) = lower(aw.email)
  WHERE aw.id = wi.invited_by;
ALTER TABLE workforce_invitations DROP COLUMN IF EXISTS invited_by;
ALTER TABLE workforce_invitations RENAME COLUMN invited_by_employee_id TO invited_by;

-- 2b. workforce_role_members.assigned_by
ALTER TABLE workforce_role_members
  DROP CONSTRAINT IF EXISTS workforce_role_members_assigned_by_fkey;
ALTER TABLE workforce_role_members
  ADD COLUMN IF NOT EXISTS assigned_by_employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL;
UPDATE workforce_role_members m
  SET assigned_by_employee_id = we.id
  FROM admin_whitelist aw
  JOIN workforce_employees we ON lower(we.email) = lower(aw.email)
  WHERE aw.id = m.assigned_by;
ALTER TABLE workforce_role_members DROP COLUMN IF EXISTS assigned_by;
ALTER TABLE workforce_role_members RENAME COLUMN assigned_by_employee_id TO assigned_by;

-- 2c. workforce_leave_requests.reviewed_by
ALTER TABLE workforce_leave_requests
  DROP CONSTRAINT IF EXISTS workforce_leave_requests_reviewed_by_fkey;
ALTER TABLE workforce_leave_requests
  ADD COLUMN IF NOT EXISTS reviewed_by_employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL;
UPDATE workforce_leave_requests lr
  SET reviewed_by_employee_id = we.id
  FROM admin_whitelist aw
  JOIN workforce_employees we ON lower(we.email) = lower(aw.email)
  WHERE aw.id = lr.reviewed_by;
ALTER TABLE workforce_leave_requests DROP COLUMN IF EXISTS reviewed_by;
ALTER TABLE workforce_leave_requests RENAME COLUMN reviewed_by_employee_id TO reviewed_by;

-- 3. Update cms_role() to resolve via workforce_employees instead of
--    admin_whitelist. Authoritative source first (employee row keyed on
--    Clerk sub claim); JWT metadata hint is a fallback for /contribute
--    authors who have no employee row.
--
--    IMPORTANT: auth.jwt() ->> 'sub' is the established Clerk-id pattern in
--    this DB (see 20260505000001_advice_article_contributor_workflow.sql).
--    requesting_user_id() returns public.users.id (UUID), not a Clerk id —
--    it cannot match workforce_employees.clerk_user_id (text 'user_...').
CREATE OR REPLACE FUNCTION cms_role() RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE v_role text; BEGIN
  -- Authoritative first: employee row by Clerk subject claim.
  SELECT public.workforce_role_legacy_bucket(we.dashboard_role_id)
    INTO v_role
    FROM workforce_employees we
    WHERE we.clerk_user_id = (auth.jwt() ->> 'sub')
      AND we.dashboard_access = true
    LIMIT 1;
  IF v_role IS NOT NULL AND v_role != '' THEN RETURN v_role; END IF;
  -- Fall back to JWT metadata claims only when no employee row exists
  -- (covers /contribute authors who have a Clerk role but no employee record).
  v_role := COALESCE(
    auth.jwt() -> 'metadata' ->> 'role',
    auth.jwt() -> 'public_metadata' ->> 'role',
    auth.jwt() -> 'app_metadata' ->> 'role',
    ''
  );
  RETURN v_role;
END; $$;

-- Partial index so the employee-row lookup in cms_role() and RLS policies
-- is a fast index scan rather than a seq scan on every request.
CREATE INDEX IF NOT EXISTS idx_workforce_employees_clerk_user_id
  ON workforce_employees (clerk_user_id)
  WHERE dashboard_access = true;

-- 4. Repoint is_workforce_admin() / is_workforce_reader() from admin_whitelist
--    to workforce_employees + workforce_role_legacy_bucket. This completes the
--    cutover so those functions stop touching the now-dropped table.
CREATE OR REPLACE FUNCTION public.is_workforce_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workforce_employees we
    WHERE we.clerk_user_id = (auth.jwt() ->> 'sub')
      AND we.dashboard_access = true
      AND public.workforce_role_legacy_bucket(we.dashboard_role_id) IN ('owner', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = requesting_user_id()
      AND u.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workforce_reader()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workforce_employees we
    WHERE we.clerk_user_id = (auth.jwt() ->> 'sub')
      AND we.dashboard_access = true
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = requesting_user_id()
      AND u.role = 'admin'
  );
$$;

-- 5. Drop admin_whitelist now that all references are repointed.
DROP TABLE IF EXISTS admin_whitelist;

NOTIFY pgrst, 'reload schema';
