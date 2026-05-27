-- Daily task reports — every employee writes a short end-of-day report of
-- what they worked on; admins track them by date and by person. Backs:
--   /me/daily-report          — the employee's own write surface + history
--   /workforce/daily-reports  — admin tracking view (filter by date/employee)
--
-- One report per (employee, date). Employees own their rows: the admin app
-- writes via the service role key (bypasses RLS) and enforces "you can only
-- write your own report" inside the server action by matching the caller's
-- email to a workforce_employees row (mirrors the my-tasks / intern_tasks
-- pattern). The RLS policies below are belt-and-braces: if anyone ever hits
-- this table with a user JWT, only workforce readers can read and only
-- workforce admins can write.

CREATE TABLE IF NOT EXISTS workforce_daily_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  -- What the person worked on today. Required — an empty report is no report.
  summary text NOT NULL CHECK (length(btrim(summary)) > 0),
  -- Anything blocking them / needs follow-up. Optional.
  blockers text,
  -- Self-reported hours. Optional; 0–24 guard keeps obvious typos out.
  hours_worked numeric(4,2) CHECK (hours_worked IS NULL OR (hours_worked >= 0 AND hours_worked <= 24)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, report_date)
);

-- Admin view lists newest-first across everyone, and drills into one
-- person's history; both are served by these indexes.
CREATE INDEX IF NOT EXISTS idx_workforce_daily_reports_date
  ON workforce_daily_reports (report_date DESC);
CREATE INDEX IF NOT EXISTS idx_workforce_daily_reports_employee_date
  ON workforce_daily_reports (employee_id, report_date DESC);

DROP TRIGGER IF EXISTS trg_workforce_daily_reports_updated_at ON workforce_daily_reports;
CREATE TRIGGER trg_workforce_daily_reports_updated_at
  BEFORE UPDATE ON workforce_daily_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE workforce_daily_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workforce_daily_reports_read" ON workforce_daily_reports;
CREATE POLICY "workforce_daily_reports_read" ON workforce_daily_reports
  FOR SELECT TO authenticated
  USING (is_workforce_reader());

DROP POLICY IF EXISTS "workforce_daily_reports_write" ON workforce_daily_reports;
CREATE POLICY "workforce_daily_reports_write" ON workforce_daily_reports
  FOR ALL TO authenticated
  USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());

COMMENT ON TABLE workforce_daily_reports IS
  'Workforce module — employee end-of-day task reports, one per (employee, date). RLS: admin-only; employee ownership enforced in the server action.';

NOTIFY pgrst, 'reload schema';
