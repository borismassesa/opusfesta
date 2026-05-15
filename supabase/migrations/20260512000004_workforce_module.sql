-- Workforce module — first cut of the HR data model. Backs the
-- `/workforce/*` admin pages: Employees, Schedule, Payroll, Leave,
-- Roles, Recruitment.
--
-- Surface area:
--   workforce_employees       — directory of people
--   workforce_shifts          — weekly roster (one row per employee × weekday)
--   workforce_payroll_runs    — monthly payroll periods
--   workforce_leave_requests  — leave applications + approvals
--   workforce_attendance      — daily clock-in/out
--   workforce_roles           — access roles inside the admin platform
--   workforce_jobs            — open positions
--   workforce_candidates      — applicants tied to a job
--
-- Access model: every workforce table is admin-only. The admin app
-- talks to these tables via the service role key, which bypasses RLS,
-- and enforces authz inside server actions (`requireAdminRole`). The
-- RLS policies below are belt-and-braces: if anyone ever hits these
-- tables with a user JWT, only owner/admin users can read or write.
--
-- Seed data scope: payroll runs + system roles only (foundational rows
-- the Payroll and Roles & Permissions pages need to render). The original
-- 18 employees / 5 open jobs / candidates / shifts / leave / attendance
-- fixtures were removed on 2026-05-14 — the workforce module now ships
-- empty so admins populate it themselves via the UI.

-- =============================================================================
-- Helper: who counts as a workforce admin
-- =============================================================================
-- Re-uses requesting_user_id() (Clerk → users.id) + admin_whitelist. We
-- look at admin_whitelist directly because `is_platform_admin()` only
-- checks users.role='admin', which doesn't cover the whitelist-only
-- owners and admins who haven't been mirrored into users yet.

CREATE OR REPLACE FUNCTION public.is_workforce_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_whitelist aw
    WHERE aw.user_id = requesting_user_id()
      AND aw.is_active = true
      AND aw.role IN ('owner', 'admin')
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = requesting_user_id()
      AND u.role = 'admin'
  );
$$;

-- Editors / viewers can read but not mutate. Same family of checks.
CREATE OR REPLACE FUNCTION public.is_workforce_reader()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_whitelist aw
    WHERE aw.user_id = requesting_user_id()
      AND aw.is_active = true
      AND aw.role IN ('owner', 'admin', 'editor', 'viewer')
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = requesting_user_id()
      AND u.role = 'admin'
  );
$$;

-- =============================================================================
-- workforce_employees — the directory
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  job_title text NOT NULL,
  department text NOT NULL CHECK (department IN (
    'Operations', 'Engineering', 'Product', 'Design', 'Marketing',
    'Vendor Success', 'Finance', 'People', 'Studio'
  )),
  manager_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  employment_type text NOT NULL DEFAULT 'Permanent'
    CHECK (employment_type IN ('Permanent', 'Contract', 'Probation', 'Intern')),
  status text NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'On Leave', 'Onboarding', 'Resigned')),
  location text NOT NULL DEFAULT 'Dar es Salaam'
    CHECK (location IN ('Dar es Salaam', 'Arusha', 'Zanzibar', 'Remote')),
  start_date date NOT NULL,
  salary_tzs bigint NOT NULL CHECK (salary_tzs >= 0),
  leave_balance_days integer NOT NULL DEFAULT 0 CHECK (leave_balance_days >= 0),
  avatar_color text NOT NULL DEFAULT '#F0DFF6',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workforce_employees_department
  ON workforce_employees (department);
CREATE INDEX IF NOT EXISTS idx_workforce_employees_status
  ON workforce_employees (status);
CREATE INDEX IF NOT EXISTS idx_workforce_employees_manager
  ON workforce_employees (manager_id);

-- =============================================================================
-- workforce_shifts — weekly roster
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_shifts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  shift_type text NOT NULL
    CHECK (shift_type IN ('Full day', 'Half day', 'On-call', 'Remote', 'Off')),
  start_time time,
  end_time time,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, weekday)
);

CREATE INDEX IF NOT EXISTS idx_workforce_shifts_employee
  ON workforce_shifts (employee_id);

-- =============================================================================
-- workforce_payroll_runs — monthly periods
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_payroll_runs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  period text NOT NULL UNIQUE,                 -- "May 2026"
  pay_date date NOT NULL,
  status text NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'In review', 'Approved', 'Paid')),
  headcount integer NOT NULL DEFAULT 0,
  gross_tzs bigint NOT NULL DEFAULT 0,
  paye_tzs bigint NOT NULL DEFAULT 0,
  nssf_tzs bigint NOT NULL DEFAULT 0,
  net_tzs bigint NOT NULL DEFAULT 0,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workforce_payroll_runs_pay_date
  ON workforce_payroll_runs (pay_date DESC);

-- =============================================================================
-- workforce_leave_requests
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_leave_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL
    CHECK (leave_type IN ('Annual', 'Sick', 'Maternity', 'Paternity', 'Compassionate', 'Unpaid')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  days integer NOT NULL CHECK (days > 0),
  status text NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
  reason text NOT NULL,
  reviewed_by uuid REFERENCES admin_whitelist(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_workforce_leave_employee
  ON workforce_leave_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_workforce_leave_status
  ON workforce_leave_requests (status);

-- =============================================================================
-- workforce_attendance — one row per (employee, date)
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  clock_in time,
  clock_out time,
  status text NOT NULL DEFAULT 'Present'
    CHECK (status IN ('Present', 'Late', 'Absent', 'Remote', 'Leave')),
  worked_hours numeric(4,2) NOT NULL DEFAULT 0 CHECK (worked_hours >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, work_date)
);

CREATE INDEX IF NOT EXISTS idx_workforce_attendance_date
  ON workforce_attendance (work_date DESC);

-- =============================================================================
-- workforce_roles + permissions
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  permission_keys text[] NOT NULL DEFAULT '{}',
  members_count integer NOT NULL DEFAULT 0,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- workforce_jobs + workforce_candidates
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  department text NOT NULL,
  location text NOT NULL,
  employment_type text NOT NULL
    CHECK (employment_type IN ('Permanent', 'Contract', 'Probation', 'Intern')),
  status text NOT NULL DEFAULT 'Open'
    CHECK (status IN ('Open', 'On hold', 'Closed')),
  opened_at date NOT NULL DEFAULT CURRENT_DATE,
  posted_salary_min_tzs bigint NOT NULL,
  posted_salary_max_tzs bigint NOT NULL,
  hiring_manager text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (posted_salary_max_tzs >= posted_salary_min_tzs)
);

CREATE INDEX IF NOT EXISTS idx_workforce_jobs_status
  ON workforce_jobs (status);

CREATE TABLE IF NOT EXISTS workforce_candidates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid NOT NULL REFERENCES workforce_jobs(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  stage text NOT NULL DEFAULT 'Applied'
    CHECK (stage IN ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected')),
  source text NOT NULL DEFAULT 'Direct'
    CHECK (source IN ('LinkedIn', 'Referral', 'Careers Page', 'Direct', 'Brighter Monday')),
  rating smallint NOT NULL DEFAULT 3 CHECK (rating BETWEEN 1 AND 5),
  applied_at date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, email)
);

CREATE INDEX IF NOT EXISTS idx_workforce_candidates_job
  ON workforce_candidates (job_id);
CREATE INDEX IF NOT EXISTS idx_workforce_candidates_stage
  ON workforce_candidates (stage);

-- =============================================================================
-- updated_at triggers
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'workforce_employees',
      'workforce_shifts',
      'workforce_payroll_runs',
      'workforce_leave_requests',
      'workforce_attendance',
      'workforce_roles',
      'workforce_jobs',
      'workforce_candidates'
    ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
      t, t
    );
  END LOOP;
END $$;

-- =============================================================================
-- RLS — admin-only across the board
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'workforce_employees',
      'workforce_shifts',
      'workforce_payroll_runs',
      'workforce_leave_requests',
      'workforce_attendance',
      'workforce_roles',
      'workforce_jobs',
      'workforce_candidates'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format(
      'DROP POLICY IF EXISTS "workforce_read" ON %I;
       CREATE POLICY "workforce_read" ON %I FOR SELECT TO authenticated
       USING (is_workforce_reader());', t, t
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS "workforce_write" ON %I;
       CREATE POLICY "workforce_write" ON %I FOR ALL TO authenticated
       USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());', t, t
    );
  END LOOP;
END $$;

-- =============================================================================
-- Seed data — foundational rows only (payroll runs, system roles)
-- =============================================================================
-- The original employee / job / candidate / shift / leave / attendance
-- fixtures were removed on 2026-05-14 so the module ships empty. See
-- 20260514000001_workforce_remove_seed_fixtures.sql for the live-DB
-- delete; this file is the source of truth for fresh setups.

-- Payroll runs
INSERT INTO workforce_payroll_runs
  (period, pay_date, status, headcount, gross_tzs, paye_tzs, nssf_tzs, net_tzs)
VALUES
  ('May 2026',      '2026-05-28', 'In review', 16, 102400000, 18900000, 10240000, 73260000),
  ('April 2026',    '2026-04-28', 'Paid',      16, 101600000, 18400000, 10160000, 73040000),
  ('March 2026',    '2026-03-28', 'Paid',      15,  96300000, 17200000,  9630000, 69470000),
  ('February 2026', '2026-02-28', 'Paid',      15,  95900000, 17100000,  9590000, 69210000)
ON CONFLICT (period) DO NOTHING;

-- Roles (full permission key list embedded so the matrix renders the
-- same content out of the box; admins can edit later via the UI).
INSERT INTO workforce_roles (slug, name, description, permission_keys, members_count, is_system) VALUES
  ('owner',          'Owner',          'Founders. Full access including platform settings and payroll release.',
    ARRAY['cms.read','cms.write','cms.publish','vendor.read','vendor.moderate','bookings.read','bookings.write','finance.read','finance.write','workforce.read','workforce.write','workforce.payroll','insights.read','platform.admin'], 2, true),
  ('admin',          'Admin',          'Senior operators. Everything except platform-level configuration.',
    ARRAY['cms.read','cms.write','cms.publish','vendor.read','vendor.moderate','bookings.read','bookings.write','finance.read','finance.write','workforce.read','workforce.write','workforce.payroll','insights.read'], 4, true),
  ('people-ops',     'People Ops',     'HR. Manages employees, payroll and leave but no marketplace tooling.',
    ARRAY['workforce.read','workforce.write','workforce.payroll','finance.read','insights.read'], 2, false),
  ('finance',        'Finance',        'Finance team — payouts, reconciliation and reporting.',
    ARRAY['finance.read','finance.write','bookings.read','insights.read','workforce.read'], 2, false),
  ('content-editor', 'Content Editor', 'Curates the marketing site and the inspiration library.',
    ARRAY['cms.read','cms.write','cms.publish','vendor.read'], 3, true),
  ('vendor-success', 'Vendor Success', 'Vendor onboarding and moderation, no finance reach.',
    ARRAY['vendor.read','vendor.moderate','bookings.read','cms.read'], 5, false),
  ('viewer',         'Viewer',         'Read-only access for analysts and audits.',
    ARRAY['cms.read','vendor.read','bookings.read','finance.read','workforce.read','insights.read'], 4, true)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE workforce_employees      IS 'Workforce module — employee directory. RLS: admin-only.';
COMMENT ON TABLE workforce_shifts         IS 'Workforce module — weekly shift roster. RLS: admin-only.';
COMMENT ON TABLE workforce_payroll_runs   IS 'Workforce module — monthly payroll periods. RLS: admin-only.';
COMMENT ON TABLE workforce_leave_requests IS 'Workforce module — leave applications + approval state. RLS: admin-only.';
COMMENT ON TABLE workforce_attendance     IS 'Workforce module — daily clock-in/out. RLS: admin-only.';
COMMENT ON TABLE workforce_roles          IS 'Workforce module — internal admin access roles + permission keys. RLS: admin-only.';
COMMENT ON TABLE workforce_jobs           IS 'Workforce module — open positions / recruitment. RLS: admin-only.';
COMMENT ON TABLE workforce_candidates     IS 'Workforce module — candidates in a job pipeline. RLS: admin-only.';

NOTIFY pgrst, 'reload schema';
