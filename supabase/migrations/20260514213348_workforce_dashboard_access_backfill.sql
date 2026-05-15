-- Backfill — promote each legacy admin_whitelist row into a real
-- workforce_employees row with dashboard_access=true and the matching
-- workforce role. After this migration, the People tab on /workforce/
-- roles can show all existing admins (Boris, Edith, etc.) using the
-- merged "employee with dashboard access" model.
--
-- Idempotent: rows that already exist (matched by lowercased email) are
-- updated rather than re-inserted, so re-running this migration is a
-- no-op on an already-converted DB.
--
-- The sync trigger sync_employee_to_admin_whitelist is what normally
-- keeps admin_whitelist in step with workforce_employees. Here we're
-- going the OTHER way one time only — admin_whitelist already has the
-- legacy data, and the trigger will leave those rows alone because the
-- UPDATE only sets `dashboard_access` and `dashboard_role_id` (not
-- `email`), and the trigger's UPSERT path won't change anything when
-- admin_whitelist already matches.

-- Step 1: insert employee stubs for any admin_whitelist email that
-- doesn't yet have a workforce_employees row.
WITH admin_rows AS (
  SELECT
    aw.email AS email,
    COALESCE(NULLIF(TRIM(aw.full_name), ''), split_part(aw.email, '@', 1)) AS full_name,
    aw.role AS legacy_role,
    aw.added_at,
    -- Map admin_whitelist.role → workforce_roles.slug. The slug-alignment
    -- migration (20260514xxxxxx_workforce_roles_align_slugs_to_admin_whitelist)
    -- already renamed 'content-editor' → 'editor' and added 'author', so
    -- the legacy role values match workforce_roles.slug 1:1 today.
    wr.id AS dashboard_role_id
  FROM admin_whitelist aw
  LEFT JOIN workforce_roles wr ON wr.slug = aw.role
  LEFT JOIN workforce_employees we ON lower(we.email) = lower(aw.email)
  WHERE aw.is_active = true
    AND we.id IS NULL
    AND wr.id IS NOT NULL
),
-- Next available OF-XXX employee code. Picks from the existing employees
-- so the numbering stays contiguous; falls back to OF-001 on empty DB.
next_code AS (
  SELECT COALESCE(
    MAX(NULLIF(regexp_replace(employee_code, '\D', '', 'g'), '')::int),
    0
  ) AS base
  FROM workforce_employees
  WHERE employee_code LIKE 'OF-%'
)
INSERT INTO workforce_employees (
  employee_code,
  full_name,
  email,
  job_title,
  department,
  employment_type,
  status,
  location,
  start_date,
  salary_tzs,
  leave_balance_days,
  avatar_color,
  dashboard_access,
  dashboard_role_id
)
SELECT
  'OF-' || lpad((next_code.base + row_number() OVER (ORDER BY admin_rows.email))::text, 3, '0'),
  admin_rows.full_name,
  admin_rows.email,
  'Admin',
  'Operations'::text,
  'Permanent'::text,
  'Active'::text,
  'Remote'::text,
  COALESCE(admin_rows.added_at::date, CURRENT_DATE),
  0,
  21,
  -- Stable purple-leaning palette pick per email so backfilled rows
  -- still get a recognisable avatar.
  CASE (abs(hashtext(admin_rows.email)) % 8)
    WHEN 0 THEN '#F0DFF6'
    WHEN 1 THEN '#FFF3D9'
    WHEN 2 THEN '#E5F2FB'
    WHEN 3 THEN '#FCE8F0'
    WHEN 4 THEN '#DDF6E3'
    WHEN 5 THEN '#FFE3D1'
    WHEN 6 THEN '#E4E0FB'
    ELSE        '#D6F0EE'
  END,
  true,
  admin_rows.dashboard_role_id
FROM admin_rows, next_code;

-- Step 2: for legacy admins whose employee row was created earlier
-- (e.g. via the Employees → Add employee flow) but never had
-- dashboard_access turned on, flip the bit so they appear in the
-- People tab.
UPDATE workforce_employees we
SET
  dashboard_access = true,
  dashboard_role_id = wr.id
FROM admin_whitelist aw
JOIN workforce_roles wr ON wr.slug = aw.role
WHERE lower(aw.email) = lower(we.email)
  AND aw.is_active = true
  AND we.dashboard_access = false;

NOTIFY pgrst, 'reload schema';
