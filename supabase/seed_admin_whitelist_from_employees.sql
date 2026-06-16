-- Seed admin_whitelist from the workforce directory, based on each employee's
-- dashboard role. This is the durable replacement for the /temp-access passcode
-- and the DISABLE_ADMIN_AUTH dev flag: it grants real, role-scoped dashboard
-- access to every employee who already has it in the workforce module.
--
-- Run AFTER supabase/migrations/040_create_admin_whitelist.sql (which creates
-- the admin_whitelist table). Run against the SAME Supabase project the
-- opus_admin app reads from (prod: ppdapuqehwlfwofbpbvb). Safe in the SQL Editor.
--
-- Idempotent: re-running re-syncs each employee's role + reactivates the row.
-- Re-run it whenever you change someone's dashboard role or add staff.
--
-- WHY a join, not hardcoded rows: admin_whitelist gates *access* + the high
-- level role (owner/admin/editor/viewer); granular permissions still come from
-- the employee's workforce_roles. So we map the workforce dashboard role → the
-- access role and let the workforce side keep driving fine-grained permissions.
--
-- NOTE: the account must ALSO exist in the shared Clerk instance
-- (clerk.opusfesta.com) to actually sign in — this only grants authorization.

INSERT INTO admin_whitelist (email, full_name, role, is_active)
SELECT
  lower(e.email)                          AS email,
  e.full_name                             AS full_name,
  CASE r.slug
    WHEN 'owner'          THEN 'owner'
    WHEN 'admin'          THEN 'admin'
    WHEN 'editor'         THEN 'editor'
    WHEN 'content-editor' THEN 'editor'
    WHEN 'viewer'         THEN 'viewer'
    -- Custom ops roles (finance / people-ops / vendor-success): give an access
    -- ticket at 'viewer'; their real permissions come from workforce_roles.
    ELSE 'viewer'
  END                                     AS role,
  true                                    AS is_active
FROM workforce_employees e
JOIN workforce_roles r ON r.id = e.dashboard_role_id
WHERE e.dashboard_access = true
  AND e.email IS NOT NULL
  AND e.email <> ''
  -- Authors belong on /contribute, not the admin dashboard — never whitelist.
  AND r.slug <> 'author'
ON CONFLICT (email) DO UPDATE
SET role      = EXCLUDED.role,
    is_active = true,
    full_name = COALESCE(admin_whitelist.full_name, EXCLUDED.full_name);

-- Review what got granted.
SELECT email, full_name, role, is_active
FROM admin_whitelist
ORDER BY role, email;
