-- Workforce — department-driven access fallback.
--
-- Until now, an employee's effective permissions came strictly from
-- explicit role assignments: their workforce_employees.dashboard_role_id
-- + any workforce_role_members rows. Employees with neither got an
-- empty permission set, which left them stuck even after invitation.
--
-- This migration:
--   1. Defines a canonical department → default role mapping in SQL
--      (function workforce_default_role_id_for_department).
--   2. Updates workforce_permissions_for_employee to fall back to the
--      department default when no explicit role is set.
--   3. Backfills dashboard_role_id for current employees who don't
--      have one, using the same mapping. Existing assignments are NOT
--      overwritten.
--
-- Mapping (matches apps/opus_admin design discussion 2026-05-18):
--   Founders                         → owner
--   Technology                       → admin
--   HR                               → people-ops
--   Finance & Accountings            → finance
--   Operations                       → vendor-success
--   Marketing & Partnership          → content-editor
--   Content, Brand and Social Media  → content-editor
--   UI & UX Design                   → content-editor
--   Studio                           → vendor-success
--
-- Note: dashboard_access is intentionally NOT changed here. Granting
-- login still goes through grantDashboardAccess() / the Clerk
-- invitation flow so admins control when emails go out.

-- =============================================================================
-- 1. workforce_default_role_id_for_department
-- =============================================================================

CREATE OR REPLACE FUNCTION public.workforce_default_role_id_for_department(p_department text)
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT id FROM workforce_roles
   WHERE slug = CASE p_department
     WHEN 'Founders'                        THEN 'owner'
     WHEN 'Technology'                      THEN 'admin'
     WHEN 'HR'                              THEN 'people-ops'
     WHEN 'Finance & Accountings'           THEN 'finance'
     WHEN 'Operations'                      THEN 'vendor-success'
     WHEN 'Marketing & Partnership'         THEN 'content-editor'
     WHEN 'Content, Brand and Social Media' THEN 'content-editor'
     WHEN 'UI & UX Design'                  THEN 'content-editor'
     WHEN 'Studio'                          THEN 'vendor-success'
   END
   LIMIT 1;
$$;

COMMENT ON FUNCTION public.workforce_default_role_id_for_department(text) IS
  'Canonical department → workforce_roles fallback used when an employee has no explicit role assignment.';

-- =============================================================================
-- 2. workforce_permissions_for_employee — now falls back to dept default
-- =============================================================================

CREATE OR REPLACE FUNCTION public.workforce_permissions_for_employee(p_employee_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  WITH explicit_role_ids AS (
    SELECT dashboard_role_id AS role_id
      FROM workforce_employees
     WHERE id = p_employee_id AND dashboard_role_id IS NOT NULL
    UNION
    SELECT role_id
      FROM workforce_role_members
     WHERE employee_id = p_employee_id
  ),
  fallback_role_ids AS (
    -- Only fire the fallback when there's no explicit assignment.
    SELECT workforce_default_role_id_for_department(we.department) AS role_id
      FROM workforce_employees we
     WHERE we.id = p_employee_id
       AND NOT EXISTS (SELECT 1 FROM explicit_role_ids)
  ),
  all_role_ids AS (
    SELECT role_id FROM explicit_role_ids WHERE role_id IS NOT NULL
    UNION
    SELECT role_id FROM fallback_role_ids WHERE role_id IS NOT NULL
  ),
  perms AS (
    SELECT DISTINCT pk
      FROM all_role_ids r
      JOIN workforce_roles wr ON wr.id = r.role_id
      CROSS JOIN LATERAL unnest(wr.permission_keys) AS pk
  )
  SELECT COALESCE(array_agg(pk ORDER BY pk), ARRAY[]::text[]) FROM perms;
$$;

-- =============================================================================
-- 3. Backfill dashboard_role_id for employees missing one
-- =============================================================================
-- Only touches rows where dashboard_role_id IS NULL — existing
-- assignments (including the Owner) are preserved as-is.

UPDATE workforce_employees we
   SET dashboard_role_id = workforce_default_role_id_for_department(we.department),
       updated_at = now()
 WHERE we.dashboard_role_id IS NULL
   AND we.status != 'Resigned'
   AND workforce_default_role_id_for_department(we.department) IS NOT NULL;

NOTIFY pgrst, 'reload schema';
