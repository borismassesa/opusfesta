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
-- Seed data mirrors the original `_lib/data.ts` fixtures one-for-one,
-- so the UI looks identical the moment this migration lands.

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
-- Seed data — mirrors the original fixtures one-for-one
-- =============================================================================

-- Employees (insert; managers wired in a second pass once IDs exist).
INSERT INTO workforce_employees
  (employee_code, full_name, email, phone, job_title, department, employment_type, status, location, start_date, salary_tzs, leave_balance_days, avatar_color)
VALUES
  ('OF-001', 'Asha Mwangi',          'asha.mwangi@opusfesta.com',     '+255 712 884 011', 'Head of Operations',           'Operations',     'Permanent', 'Active',     'Dar es Salaam', '2022-03-14',  9800000, 14, '#F0DFF6'),
  ('OF-002', 'Boniface Lema',        'boniface.lema@opusfesta.com',   '+255 754 220 198', 'Vendor Success Lead',          'Vendor Success', 'Permanent', 'Active',     'Dar es Salaam', '2022-08-01',  6400000,  9, '#FFF3D9'),
  ('OF-003', 'Catherine Njau',       'catherine.njau@opusfesta.com',  '+255 689 451 700', 'Senior Product Designer',      'Design',         'Permanent', 'Active',     'Remote',        '2023-01-09',  7200000, 21, '#E5F2FB'),
  ('OF-004', 'Daniel Okello',        'daniel.okello@opusfesta.com',   '+255 776 003 122', 'Head of Product',              'Product',        'Permanent', 'Active',     'Dar es Salaam', '2021-11-21', 11500000,  6, '#FCE8F0'),
  ('OF-005', 'Esther Kimaro',        'esther.kimaro@opusfesta.com',   '+255 783 666 902', 'Studio Coordinator',           'Studio',         'Contract',  'On Leave',   'Arusha',        '2023-06-30',  4100000,  0, '#DDF6E3'),
  ('OF-006', 'Faraja Mtui',          'faraja.mtui@opusfesta.com',     '+255 715 224 850', 'Full-Stack Engineer',          'Engineering',    'Permanent', 'Active',     'Remote',        '2023-04-04',  8300000, 11, '#FFE3D1'),
  ('OF-007', 'Grace Pallangyo',      'grace.pallangyo@opusfesta.com', '+255 769 887 412', 'Marketing Manager',            'Marketing',      'Permanent', 'Active',     'Dar es Salaam', '2022-05-18',  6900000,  8, '#E4E0FB'),
  ('OF-008', 'Hassan Idris',         'hassan.idris@opusfesta.com',    '+255 742 553 990', 'Engineering Lead',             'Engineering',    'Permanent', 'Active',     'Dar es Salaam', '2021-09-13', 12400000, 18, '#D6F0EE'),
  ('OF-009', 'Imani Kileo',          'imani.kileo@opusfesta.com',     '+255 718 114 002', 'Finance Analyst',              'Finance',        'Permanent', 'Active',     'Dar es Salaam', '2024-02-12',  5200000, 19, '#F0DFF6'),
  ('OF-010', 'Joyce Mbise',          'joyce.mbise@opusfesta.com',     '+255 758 660 211', 'People Operations Partner',    'People',         'Permanent', 'Active',     'Dar es Salaam', '2023-09-05',  5900000, 16, '#FFF3D9'),
  ('OF-011', 'Kelvin Massawe',       'kelvin.massawe@opusfesta.com',  '+255 762 887 553', 'Junior Product Designer',      'Design',         'Probation', 'Onboarding', 'Dar es Salaam', '2026-04-22',  3400000,  2, '#E5F2FB'),
  ('OF-012', 'Lulu Shayo',           'lulu.shayo@opusfesta.com',      '+255 719 446 088', 'Vendor Onboarding Specialist', 'Vendor Success', 'Contract',  'Active',     'Zanzibar',      '2024-07-01',  3800000, 12, '#FCE8F0'),
  ('OF-013', 'Mussa Kazimoto',       'mussa.kazimoto@opusfesta.com',  '+255 766 339 124', 'Backend Engineer',             'Engineering',    'Permanent', 'Active',     'Remote',        '2024-01-15',  7800000, 13, '#DDF6E3'),
  ('OF-014', 'Naomi Komba',          'naomi.komba@opusfesta.com',     '+255 745 003 781', 'Content Marketing Editor',     'Marketing',      'Permanent', 'Active',     'Dar es Salaam', '2023-11-02',  4600000, 15, '#FFE3D1'),
  ('OF-015', 'Omary Mwakalindile',   'omary.m@opusfesta.com',         '+255 783 220 919', 'Production Intern',            'Studio',         'Intern',    'Onboarding', 'Arusha',        '2026-05-04',   900000,  0, '#E4E0FB'),
  ('OF-016', 'Paulina Reuben',       'paulina.reuben@opusfesta.com',  '+255 712 003 884', 'Senior Backend Engineer',      'Engineering',    'Permanent', 'Active',     'Dar es Salaam', '2022-02-28',  9200000,  7, '#D6F0EE'),
  ('OF-017', 'Queen Sanga',          'queen.sanga@opusfesta.com',     '+255 758 117 884', 'Customer Success Associate',   'Operations',     'Permanent', 'Active',     'Dar es Salaam', '2024-03-25',  3900000, 10, '#F0DFF6'),
  ('OF-018', 'Rajab Mwinyi',         'rajab.mwinyi@opusfesta.com',    '+255 769 442 003', 'Studio Photographer',          'Studio',         'Contract',  'Resigned',   'Zanzibar',      '2022-01-18',  4800000,  0, '#FFF3D9')
ON CONFLICT (employee_code) DO NOTHING;

-- Manager links — second pass, once the rows exist.
UPDATE workforce_employees e
SET manager_id = m.id
FROM workforce_employees m
WHERE m.employee_code = CASE e.employee_code
  WHEN 'OF-002' THEN 'OF-001'
  WHEN 'OF-003' THEN 'OF-004'
  WHEN 'OF-005' THEN 'OF-001'
  WHEN 'OF-006' THEN 'OF-008'
  WHEN 'OF-008' THEN 'OF-004'
  WHEN 'OF-010' THEN 'OF-001'
  WHEN 'OF-011' THEN 'OF-003'
  WHEN 'OF-012' THEN 'OF-002'
  WHEN 'OF-013' THEN 'OF-008'
  WHEN 'OF-014' THEN 'OF-007'
  WHEN 'OF-015' THEN 'OF-005'
  WHEN 'OF-016' THEN 'OF-008'
  WHEN 'OF-017' THEN 'OF-001'
  WHEN 'OF-018' THEN 'OF-005'
END
AND e.manager_id IS NULL;

-- Shifts (helper view inline so we can SELECT by code)
INSERT INTO workforce_shifts (employee_id, weekday, shift_type, start_time, end_time, note)
SELECT e.id, s.weekday, s.shift_type, s.start_time, s.end_time, s.note FROM (VALUES
  ('OF-001', 1, 'Full day', '08:30'::time, '17:30'::time, NULL),
  ('OF-001', 2, 'Full day', '08:30'::time, '17:30'::time, NULL),
  ('OF-001', 3, 'Remote',   '09:00'::time, '17:00'::time, NULL),
  ('OF-001', 4, 'Full day', '08:30'::time, '17:30'::time, NULL),
  ('OF-001', 5, 'Half day', '08:30'::time, '13:00'::time, NULL),
  ('OF-001', 6, 'Off',      NULL, NULL, NULL),
  ('OF-001', 7, 'Off',      NULL, NULL, NULL),
  ('OF-002', 1, 'Full day', '09:00'::time, '18:00'::time, NULL),
  ('OF-002', 2, 'Full day', '09:00'::time, '18:00'::time, NULL),
  ('OF-002', 3, 'Full day', '09:00'::time, '18:00'::time, NULL),
  ('OF-002', 4, 'On-call',  NULL, NULL, 'Vendor escalations'),
  ('OF-002', 5, 'Full day', '09:00'::time, '18:00'::time, NULL),
  ('OF-002', 6, 'Off',      NULL, NULL, NULL),
  ('OF-002', 7, 'Off',      NULL, NULL, NULL),
  ('OF-003', 1, 'Remote',   '10:00'::time, '18:00'::time, NULL),
  ('OF-003', 2, 'Remote',   '10:00'::time, '18:00'::time, NULL),
  ('OF-003', 3, 'Remote',   '10:00'::time, '18:00'::time, NULL),
  ('OF-003', 4, 'Remote',   '10:00'::time, '18:00'::time, NULL),
  ('OF-003', 5, 'Off',      NULL, NULL, NULL),
  ('OF-003', 6, 'Off',      NULL, NULL, NULL),
  ('OF-003', 7, 'Off',      NULL, NULL, NULL),
  ('OF-005', 1, 'Off',      NULL, NULL, 'On leave'),
  ('OF-005', 2, 'Off',      NULL, NULL, 'On leave'),
  ('OF-005', 3, 'Off',      NULL, NULL, 'On leave'),
  ('OF-005', 4, 'Off',      NULL, NULL, 'On leave'),
  ('OF-005', 5, 'Off',      NULL, NULL, 'On leave'),
  ('OF-005', 6, 'Off',      NULL, NULL, NULL),
  ('OF-005', 7, 'Off',      NULL, NULL, NULL),
  ('OF-006', 1, 'Remote',   '09:30'::time, '17:30'::time, NULL),
  ('OF-006', 2, 'Remote',   '09:30'::time, '17:30'::time, NULL),
  ('OF-006', 3, 'Full day', '09:30'::time, '17:30'::time, NULL),
  ('OF-006', 4, 'Remote',   '09:30'::time, '17:30'::time, NULL),
  ('OF-006', 5, 'Remote',   '09:30'::time, '15:00'::time, NULL),
  ('OF-006', 6, 'Off',      NULL, NULL, NULL),
  ('OF-006', 7, 'Off',      NULL, NULL, NULL),
  ('OF-008', 1, 'Full day', '08:00'::time, '17:00'::time, NULL),
  ('OF-008', 2, 'Full day', '08:00'::time, '17:00'::time, NULL),
  ('OF-008', 3, 'Full day', '08:00'::time, '17:00'::time, NULL),
  ('OF-008', 4, 'Full day', '08:00'::time, '17:00'::time, NULL),
  ('OF-008', 5, 'Full day', '08:00'::time, '17:00'::time, NULL),
  ('OF-008', 6, 'On-call',  NULL, NULL, 'Production rotation'),
  ('OF-008', 7, 'Off',      NULL, NULL, NULL),
  ('OF-010', 1, 'Full day', '08:30'::time, '17:30'::time, NULL),
  ('OF-010', 2, 'Full day', '08:30'::time, '17:30'::time, NULL),
  ('OF-010', 3, 'Half day', '08:30'::time, '13:00'::time, NULL),
  ('OF-010', 4, 'Full day', '08:30'::time, '17:30'::time, NULL),
  ('OF-010', 5, 'Full day', '08:30'::time, '17:30'::time, NULL),
  ('OF-010', 6, 'Off',      NULL, NULL, NULL),
  ('OF-010', 7, 'Off',      NULL, NULL, NULL),
  ('OF-012', 1, 'Full day', '09:00'::time, '18:00'::time, NULL),
  ('OF-012', 2, 'Full day', '09:00'::time, '18:00'::time, NULL),
  ('OF-012', 3, 'Off',      NULL, NULL, NULL),
  ('OF-012', 4, 'Full day', '09:00'::time, '18:00'::time, NULL),
  ('OF-012', 5, 'Full day', '09:00'::time, '18:00'::time, NULL),
  ('OF-012', 6, 'Half day', '09:00'::time, '13:00'::time, NULL),
  ('OF-012', 7, 'Off',      NULL, NULL, NULL)
) AS s(emp_code, weekday, shift_type, start_time, end_time, note)
JOIN workforce_employees e ON e.employee_code = s.emp_code
ON CONFLICT (employee_id, weekday) DO NOTHING;

-- Payroll runs
INSERT INTO workforce_payroll_runs
  (period, pay_date, status, headcount, gross_tzs, paye_tzs, nssf_tzs, net_tzs)
VALUES
  ('May 2026',      '2026-05-28', 'In review', 16, 102400000, 18900000, 10240000, 73260000),
  ('April 2026',    '2026-04-28', 'Paid',      16, 101600000, 18400000, 10160000, 73040000),
  ('March 2026',    '2026-03-28', 'Paid',      15,  96300000, 17200000,  9630000, 69470000),
  ('February 2026', '2026-02-28', 'Paid',      15,  95900000, 17100000,  9590000, 69210000)
ON CONFLICT (period) DO NOTHING;

-- Leave requests
INSERT INTO workforce_leave_requests
  (employee_id, leave_type, start_date, end_date, days, status, reason, submitted_at)
SELECT e.id, r.leave_type, r.start_date::date, r.end_date::date, r.days, r.status, r.reason, r.submitted_at::timestamptz
FROM (VALUES
  ('OF-005', 'Maternity',     '2026-04-20', '2026-07-20', 90, 'Approved', 'Maternity leave — first child.',     '2026-03-02'),
  ('OF-006', 'Annual',        '2026-05-18', '2026-05-22',  5, 'Pending',  'Family wedding in Mwanza.',          '2026-05-08'),
  ('OF-013', 'Sick',          '2026-05-12', '2026-05-13',  2, 'Approved', 'Flu — doctor''s note attached.',     '2026-05-12'),
  ('OF-002', 'Annual',        '2026-06-02', '2026-06-09',  7, 'Pending',  'Vacation with family — Zanzibar.',   '2026-05-10'),
  ('OF-009', 'Compassionate', '2026-04-30', '2026-05-04',  4, 'Approved', 'Bereavement.',                       '2026-04-29'),
  ('OF-014', 'Annual',        '2026-05-15', '2026-05-15',  1, 'Rejected', 'Personal matter.',                   '2026-05-09'),
  ('OF-017', 'Sick',          '2026-05-11', '2026-05-11',  1, 'Approved', 'Migraine.',                          '2026-05-11')
) AS r(emp_code, leave_type, start_date, end_date, days, status, reason, submitted_at)
JOIN workforce_employees e ON e.employee_code = r.emp_code
ON CONFLICT DO NOTHING;

-- Attendance for today (2026-05-12)
INSERT INTO workforce_attendance
  (employee_id, work_date, clock_in, clock_out, status, worked_hours)
SELECT e.id, a.work_date::date, a.clock_in, a.clock_out, a.status, a.worked_hours
FROM (VALUES
  ('OF-001', '2026-05-12', '08:24'::time, NULL::time, 'Present', 4.6),
  ('OF-002', '2026-05-12', '09:02'::time, NULL::time, 'Late',    4.0),
  ('OF-003', '2026-05-12', '10:11'::time, NULL::time, 'Remote',  2.8),
  ('OF-005', '2026-05-12', NULL::time,    NULL::time, 'Leave',   0.0),
  ('OF-006', '2026-05-12', '09:48'::time, NULL::time, 'Remote',  3.2),
  ('OF-008', '2026-05-12', '07:56'::time, NULL::time, 'Present', 5.0),
  ('OF-010', '2026-05-12', '08:31'::time, NULL::time, 'Present', 4.5),
  ('OF-012', '2026-05-12', '09:05'::time, NULL::time, 'Late',    4.0),
  ('OF-013', '2026-05-12', NULL::time,    NULL::time, 'Leave',   0.0),
  ('OF-014', '2026-05-12', '08:55'::time, NULL::time, 'Present', 4.1),
  ('OF-016', '2026-05-12', '08:15'::time, NULL::time, 'Present', 4.8),
  ('OF-017', '2026-05-12', NULL::time,    NULL::time, 'Leave',   0.0)
) AS a(emp_code, work_date, clock_in, clock_out, status, worked_hours)
JOIN workforce_employees e ON e.employee_code = a.emp_code
ON CONFLICT (employee_id, work_date) DO NOTHING;

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

-- Jobs + candidates
INSERT INTO workforce_jobs
  (slug, title, department, location, employment_type, status, opened_at,
   posted_salary_min_tzs, posted_salary_max_tzs, hiring_manager)
VALUES
  ('senior-fullstack-engineer',   'Senior Full-Stack Engineer',     'Engineering',    'Remote',         'Permanent', 'Open',    '2026-03-19',  9000000, 12000000, 'Hassan Idris'),
  ('vendor-onboarding-specialist','Vendor Onboarding Specialist',   'Vendor Success', 'Dar es Salaam',  'Permanent', 'Open',    '2026-04-01',  3500000,  4500000, 'Boniface Lema'),
  ('studio-production-lead',      'Studio Production Lead',         'Studio',         'Arusha',         'Permanent', 'Open',    '2026-04-15',  5500000,  7500000, 'Asha Mwangi'),
  ('finance-analyst-tax',         'Finance Analyst (Tax Focus)',    'Finance',        'Dar es Salaam',  'Permanent', 'On hold', '2026-02-08',  4500000,  6500000, 'Imani Kileo'),
  ('lifecycle-marketing',         'Lifecycle Marketing Specialist', 'Marketing',      'Remote',         'Contract',  'Open',    '2026-04-29',  3500000,  5000000, 'Grace Pallangyo')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO workforce_candidates (job_id, full_name, email, stage, source, rating, applied_at)
SELECT j.id, c.full_name, c.email, c.stage, c.source, c.rating::smallint, c.applied_at::date
FROM (VALUES
  ('senior-fullstack-engineer',   'Amani Munisi',       'a.munisi@example.com', 'Interview', 'LinkedIn',        4, '2026-04-12'),
  ('senior-fullstack-engineer',   'Tatu Mwalimu',       'tatu.m@example.com',   'Screening', 'Referral',        5, '2026-04-21'),
  ('senior-fullstack-engineer',   'Brian Yusuf',        'brian.y@example.com',  'Applied',   'Careers Page',    3, '2026-05-02'),
  ('senior-fullstack-engineer',   'Hawa Said',          'hawa.s@example.com',   'Offer',     'LinkedIn',        5, '2026-03-25'),
  ('senior-fullstack-engineer',   'Joel Kassim',        'joel.k@example.com',   'Rejected',  'Direct',          2, '2026-04-04'),
  ('vendor-onboarding-specialist','Ramla Hamisi',       'ramla.h@example.com',  'Interview', 'Brighter Monday', 4, '2026-04-25'),
  ('vendor-onboarding-specialist','Salim Bakari',       'salim.b@example.com',  'Applied',   'Careers Page',    3, '2026-05-01'),
  ('vendor-onboarding-specialist','Pendo Mwita',        'pendo.m@example.com',  'Screening', 'Referral',        4, '2026-04-28'),
  ('studio-production-lead',      'Frank Mlay',         'frank.m@example.com',  'Hired',     'Referral',        5, '2026-04-20'),
  ('studio-production-lead',      'Ester Mwakipesile',  'ester.m@example.com',  'Rejected',  'LinkedIn',        2, '2026-04-22'),
  ('finance-analyst-tax',         'Maua Khamis',        'maua.k@example.com',   'Interview', 'LinkedIn',        4, '2026-03-10'),
  ('lifecycle-marketing',         'Daudi Mosi',         'daudi.m@example.com',  'Applied',   'Careers Page',    3, '2026-05-06'),
  ('lifecycle-marketing',         'Neema Sembe',        'neema.s@example.com',  'Screening', 'Direct',          4, '2026-05-04')
) AS c(job_slug, full_name, email, stage, source, rating, applied_at)
JOIN workforce_jobs j ON j.slug = c.job_slug
ON CONFLICT (job_id, email) DO NOTHING;

COMMENT ON TABLE workforce_employees      IS 'Workforce module — employee directory. RLS: admin-only.';
COMMENT ON TABLE workforce_shifts         IS 'Workforce module — weekly shift roster. RLS: admin-only.';
COMMENT ON TABLE workforce_payroll_runs   IS 'Workforce module — monthly payroll periods. RLS: admin-only.';
COMMENT ON TABLE workforce_leave_requests IS 'Workforce module — leave applications + approval state. RLS: admin-only.';
COMMENT ON TABLE workforce_attendance     IS 'Workforce module — daily clock-in/out. RLS: admin-only.';
COMMENT ON TABLE workforce_roles          IS 'Workforce module — internal admin access roles + permission keys. RLS: admin-only.';
COMMENT ON TABLE workforce_jobs           IS 'Workforce module — open positions / recruitment. RLS: admin-only.';
COMMENT ON TABLE workforce_candidates     IS 'Workforce module — candidates in a job pipeline. RLS: admin-only.';

NOTIFY pgrst, 'reload schema';
