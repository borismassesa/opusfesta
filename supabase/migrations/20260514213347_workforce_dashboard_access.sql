-- Workforce RBAC + invite-only dashboard access.
--
-- Goal: a single "person" record (workforce_employees) drives
--   * who can sign in to the admin dashboard
--   * which workforce role they hold (and therefore which permissions)
--   * the lifecycle of their Clerk-mediated invitation.
--
-- The legacy admin_whitelist table is kept in place — many call sites
-- (auth, RLS, contributor flows) still read from it. A pair of triggers
-- mirrors workforce_employees → admin_whitelist so existing code keeps
-- working without a flag-day migration.
--
-- New surface area:
--   workforce_employees.dashboard_access     boolean — gate flag
--   workforce_employees.clerk_user_id        text    — set on invite acceptance
--   workforce_employees.invited_at           timestamptz
--   workforce_employees.dashboard_role_id    uuid REFERENCES workforce_roles(id)
--   workforce_employees.last_dashboard_login timestamptz
--   workforce_invitations                     — pending/accepted/revoked invites
--
-- The dashboard_role_id column is a denormalisation: workforce_role_members
-- already supports many-to-many. Picking exactly one "primary" role keeps
-- the auth path (which needs a single AdminAccessRole) simple. The M2M
-- table is preserved for future extensions (e.g. analyst who is both
-- "Finance" and "Viewer").

-- =============================================================================
-- 1. Schema additions on workforce_employees
-- =============================================================================

ALTER TABLE workforce_employees
  ADD COLUMN IF NOT EXISTS dashboard_access boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS clerk_user_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS dashboard_role_id uuid REFERENCES workforce_roles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_dashboard_login timestamptz;

CREATE INDEX IF NOT EXISTS idx_workforce_employees_clerk_user_id
  ON workforce_employees (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_workforce_employees_dashboard_access
  ON workforce_employees (dashboard_access)
  WHERE dashboard_access = true;
CREATE INDEX IF NOT EXISTS idx_workforce_employees_dashboard_role
  ON workforce_employees (dashboard_role_id);

-- A grant must always come with a role — half-granted access is undefined.
ALTER TABLE workforce_employees
  DROP CONSTRAINT IF EXISTS workforce_employees_role_when_access;
ALTER TABLE workforce_employees
  ADD CONSTRAINT workforce_employees_role_when_access
  CHECK (dashboard_access = false OR dashboard_role_id IS NOT NULL);

-- =============================================================================
-- 2. workforce_invitations — one row per pending/accepted/revoked invite
-- =============================================================================
-- We track this separately from workforce_employees because:
--   - an invite can be revoked or expire without deleting the employee row
--   - an employee can be re-invited (e.g. after losing their Clerk account)
--   - audit trail: who invited whom, when accepted, when revoked

CREATE TABLE IF NOT EXISTS workforce_invitations (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  email           text NOT NULL,
  role_id         uuid NOT NULL REFERENCES workforce_roles(id) ON DELETE RESTRICT,
  -- The Clerk invitation id (cic_…). Lets us revoke server-side via Clerk
  -- when the admin revokes our row, and lets the accept-invite landing page
  -- look up the matching invitation by token if needed.
  clerk_invitation_id text,
  -- token_hash is a sha256 of a one-time token we generate ourselves and
  -- include in the invite link (?token=…). Lets us validate the link
  -- independently of Clerk so a leaked invite link still has to match
  -- our DB row.
  token_hash      text NOT NULL UNIQUE,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by      uuid REFERENCES admin_whitelist(id) ON DELETE SET NULL,
  invited_at      timestamptz NOT NULL DEFAULT now(),
  accepted_at     timestamptz,
  revoked_at      timestamptz,
  expires_at      timestamptz NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workforce_invitations_email
  ON workforce_invitations (lower(email));
CREATE INDEX IF NOT EXISTS idx_workforce_invitations_status
  ON workforce_invitations (status);
CREATE INDEX IF NOT EXISTS idx_workforce_invitations_employee
  ON workforce_invitations (employee_id);

-- Only one pending invite per employee at a time. Revoke before re-inviting.
CREATE UNIQUE INDEX IF NOT EXISTS uq_workforce_invitations_pending_per_employee
  ON workforce_invitations (employee_id)
  WHERE status = 'pending';

DROP TRIGGER IF EXISTS trg_workforce_invitations_updated_at ON workforce_invitations;
CREATE TRIGGER trg_workforce_invitations_updated_at
  BEFORE UPDATE ON workforce_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE workforce_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workforce_invitations_read" ON workforce_invitations;
CREATE POLICY "workforce_invitations_read" ON workforce_invitations
  FOR SELECT TO authenticated USING (is_workforce_reader());

DROP POLICY IF EXISTS "workforce_invitations_write" ON workforce_invitations;
CREATE POLICY "workforce_invitations_write" ON workforce_invitations
  FOR ALL TO authenticated
  USING (is_workforce_admin())
  WITH CHECK (is_workforce_admin());

-- =============================================================================
-- 3. Sync to admin_whitelist
-- =============================================================================
-- Why mirror instead of cut over: getAdminAccessRole() and a wad of RLS
-- policies (advice_articles, vendor moderation, etc) still read from
-- admin_whitelist. Mirroring keeps the existing auth path untouched while
-- the workforce module owns the writes.
--
-- The mirror only knows the five legacy roles (owner/admin/editor/author/
-- viewer). We map workforce role slugs onto those buckets via the
-- workforce_roles_legacy_role() helper below — custom workforce roles
-- collapse onto 'admin' (writes, mostly) or 'viewer' (read-only) based on
-- whether they include any *.write/publish permission.

CREATE OR REPLACE FUNCTION public.workforce_role_legacy_bucket(role_id uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN slug IN ('owner', 'admin', 'editor', 'viewer') THEN slug
    -- Custom roles: "admin" if they can write anything, otherwise "viewer".
    -- This is intentionally coarse — admin_whitelist.role only feeds the
    -- legacy gating; fine-grained checks always go through permission_keys.
    WHEN EXISTS (
      SELECT 1 FROM unnest(permission_keys) pk
      WHERE pk LIKE '%.write' OR pk LIKE '%.publish' OR pk LIKE '%.moderate'
        OR pk = 'workforce.payroll' OR pk = 'platform.admin'
    ) THEN 'admin'
    ELSE 'viewer'
  END
  FROM workforce_roles
  WHERE id = role_id;
$$;

CREATE OR REPLACE FUNCTION public.sync_employee_to_admin_whitelist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role text;
  v_email text;
BEGIN
  -- DELETE: remove whitelist row tied to this employee's email. Idempotent.
  IF TG_OP = 'DELETE' THEN
    DELETE FROM admin_whitelist WHERE lower(email) = lower(OLD.email);
    RETURN OLD;
  END IF;

  v_email := lower(NEW.email);

  IF NEW.dashboard_access = false OR NEW.dashboard_role_id IS NULL THEN
    -- Access removed (or never granted): scrub the whitelist row so the
    -- person can't sign in, but only if it isn't a manually-added founder
    -- (which would have no matching workforce_employees row at all).
    DELETE FROM admin_whitelist WHERE lower(email) = v_email;
    RETURN NEW;
  END IF;

  v_role := public.workforce_role_legacy_bucket(NEW.dashboard_role_id);

  -- Upsert keyed on email — admin_whitelist.email is UNIQUE.
  INSERT INTO admin_whitelist (email, full_name, role, is_active)
  VALUES (v_email, NEW.full_name, v_role, true)
  ON CONFLICT (email) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role      = EXCLUDED.role,
        is_active = true;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_employee_sync_admin_whitelist ON workforce_employees;
CREATE TRIGGER trg_employee_sync_admin_whitelist
  AFTER INSERT OR UPDATE OF dashboard_access, dashboard_role_id, email, full_name
                  OR DELETE
  ON workforce_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_employee_to_admin_whitelist();

-- =============================================================================
-- 4. Helper: resolve an employee's permission keys
-- =============================================================================
-- Used by RLS or any SQL caller that wants the canonical permission set
-- for a given employee. Joins the M2M membership table AND the primary
-- dashboard_role_id, deduping. Owners get every permission via a UNION.

CREATE OR REPLACE FUNCTION public.workforce_permissions_for_employee(p_employee_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
AS $$
  WITH role_ids AS (
    SELECT dashboard_role_id AS role_id
    FROM workforce_employees WHERE id = p_employee_id AND dashboard_role_id IS NOT NULL
    UNION
    SELECT role_id FROM workforce_role_members WHERE employee_id = p_employee_id
  ),
  perms AS (
    SELECT DISTINCT pk
    FROM role_ids r
    JOIN workforce_roles wr ON wr.id = r.role_id
    CROSS JOIN LATERAL unnest(wr.permission_keys) AS pk
  )
  SELECT COALESCE(array_agg(pk ORDER BY pk), ARRAY[]::text[]) FROM perms;
$$;

-- =============================================================================
-- 5. Comments
-- =============================================================================

COMMENT ON COLUMN workforce_employees.dashboard_access IS
  'When true, this employee can sign in to the admin dashboard. Mirrored to admin_whitelist via trigger.';
COMMENT ON COLUMN workforce_employees.clerk_user_id IS
  'Clerk user id (user_…). Set when the employee accepts their invitation.';
COMMENT ON COLUMN workforce_employees.dashboard_role_id IS
  'Primary workforce role used to derive admin_whitelist.role + the permission set.';
COMMENT ON TABLE workforce_invitations IS
  'Workforce module — pending/accepted/revoked dashboard invitations. RLS: admin-only.';

NOTIFY pgrst, 'reload schema';
