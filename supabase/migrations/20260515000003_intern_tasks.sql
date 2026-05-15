-- Intern tasks — onboarding + shadowing checklist for the Interns
-- department's dashboard lane and the "My tasks" page.
--
-- Why this table: the Interns dashboard slant from the product brief is
-- "read-only metrics + 'things to learn' + onboarding tasks." The first
-- two come from existing data; this table provides the third. Each
-- row is a single assignable item with a status and an optional
-- due date, scoped to one intern.
--
-- Access model:
--   - workforce admins (people-ops) create / edit / reassign tasks
--   - everyone with workforce.read can SELECT (managers can see their
--     intern's progress)
--   - status updates land via the admin app's server action
--     (/workforce/my-tasks/actions.ts), which runs as the service role
--     and enforces an "employee_id matches caller's workforce row" gate
--
-- RLS is belt-and-braces only. The user-facing policy is
-- "workforce_reader can SELECT, workforce_admin can mutate" — same as
-- the rest of the module. If we ever shift mutations onto a user JWT,
-- a self-update policy keyed on the caller's employee id needs to be
-- added; today the service-role bypass + actions.ts gate is the
-- ownership boundary.

CREATE TABLE IF NOT EXISTS intern_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'Todo'
    CHECK (status IN ('Todo', 'In Progress', 'Done', 'Skipped')),
  category text NOT NULL DEFAULT 'Onboarding'
    CHECK (category IN ('Onboarding', 'Reading', 'Shadowing', 'Project', 'Admin')),
  due_date date,
  -- Who assigned this task. Soft-FK to workforce_employees so deletion
  -- doesn't orphan the task — we just lose the attribution.
  assigned_by uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Per-intern lookup: "tasks for employee X, sorted by due date"
-- (the My Tasks page and the Interns lane both run this query).
CREATE INDEX IF NOT EXISTS idx_intern_tasks_employee
  ON intern_tasks (employee_id, due_date NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_intern_tasks_status
  ON intern_tasks (status);

-- updated_at trigger — reuse the shared helper introduced in 20260512.
DROP TRIGGER IF EXISTS trg_intern_tasks_updated_at ON intern_tasks;
CREATE TRIGGER trg_intern_tasks_updated_at
  BEFORE UPDATE ON intern_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS — same shape as the rest of the workforce module.
ALTER TABLE intern_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "intern_tasks_read" ON intern_tasks;
CREATE POLICY "intern_tasks_read" ON intern_tasks
  FOR SELECT TO authenticated
  USING (is_workforce_reader());

DROP POLICY IF EXISTS "intern_tasks_write" ON intern_tasks;
CREATE POLICY "intern_tasks_write" ON intern_tasks
  FOR ALL TO authenticated
  USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());

COMMENT ON TABLE intern_tasks
  IS 'Workforce module — intern onboarding/shadowing checklist. RLS: admin-only.';

NOTIFY pgrst, 'reload schema';
