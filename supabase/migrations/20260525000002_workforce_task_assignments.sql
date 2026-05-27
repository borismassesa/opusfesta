-- Task assignments — admins (and dept managers) assign tasks to a single
-- employee or a whole department, one-off or recurring (daily/weekly/
-- monthly). Backs:
--   /workforce/tasks    — admin assign + tracking surface
--   /workforce/my-tasks — employees see and complete their assigned tasks
--
-- Two tables:
--   workforce_task_assignments — the definition (who, what, how often)
--   workforce_tasks            — the per-employee, per-occurrence instances
--                                that employees actually complete
--
-- Recurrence is materialised by workforce_generate_task_occurrences(),
-- run nightly by pg_cron and also called inline when an assignment is
-- created (so the first occurrence shows up immediately). Generation is
-- idempotent via the UNIQUE (assignment_id, employee_id, occurrence_date)
-- constraint + ON CONFLICT DO NOTHING.
--
-- Access model mirrors the rest of the workforce module: service role
-- (admin app) bypasses RLS and enforces authz in the server action;
-- the RLS policies below are belt-and-braces (reader can SELECT, admin
-- can mutate). Employee "complete my own task" is enforced in the
-- my-tasks server action by an employee_id == caller match.

-- =============================================================================
-- workforce_task_assignments — the definition
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_task_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  description text,
  category text NOT NULL DEFAULT 'General'
    CHECK (category IN ('General', 'Project', 'Admin', 'Reporting', 'Meeting', 'Onboarding', 'Review')),
  -- Target: exactly one of a single employee or a whole department.
  target_type text NOT NULL CHECK (target_type IN ('employee', 'department')),
  target_employee_id uuid REFERENCES workforce_employees(id) ON DELETE CASCADE,
  target_department text,
  cadence text NOT NULL DEFAULT 'once'
    CHECK (cadence IN ('once', 'daily', 'weekly', 'monthly')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  assigned_by uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  -- Bookkeeping for the generator (observability; idempotency is the
  -- unique constraint on the instance table).
  last_generated_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (target_type = 'employee' AND target_employee_id IS NOT NULL AND target_department IS NULL)
    OR
    (target_type = 'department' AND target_department IS NOT NULL AND target_employee_id IS NULL)
  ),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_workforce_task_assignments_active
  ON workforce_task_assignments (is_active) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_workforce_task_assignments_department
  ON workforce_task_assignments (target_department);

-- =============================================================================
-- workforce_tasks — per-employee, per-occurrence instances
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id uuid NOT NULL REFERENCES workforce_task_assignments(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  -- The period anchor this instance covers (the day/week/month start).
  occurrence_date date NOT NULL,
  -- Denormalised from the assignment at generation time so the employee's
  -- task list reads from one table and edits to the assignment don't
  -- silently rewrite history.
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'General',
  cadence text NOT NULL DEFAULT 'once',
  due_date date,
  status text NOT NULL DEFAULT 'Todo'
    CHECK (status IN ('Todo', 'In Progress', 'Done', 'Skipped')),
  assigned_by uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, employee_id, occurrence_date)
);

CREATE INDEX IF NOT EXISTS idx_workforce_tasks_employee
  ON workforce_tasks (employee_id, due_date NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_workforce_tasks_status
  ON workforce_tasks (status);
CREATE INDEX IF NOT EXISTS idx_workforce_tasks_assignment
  ON workforce_tasks (assignment_id);

-- =============================================================================
-- updated_at triggers
-- =============================================================================

DROP TRIGGER IF EXISTS trg_workforce_task_assignments_updated_at ON workforce_task_assignments;
CREATE TRIGGER trg_workforce_task_assignments_updated_at
  BEFORE UPDATE ON workforce_task_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_workforce_tasks_updated_at ON workforce_tasks;
CREATE TRIGGER trg_workforce_tasks_updated_at
  BEFORE UPDATE ON workforce_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- Generator — materialise occurrences up to today
-- =============================================================================
-- For each active assignment, ensure a per-employee task row exists for
-- every occurrence date implied by its cadence between start_date and
-- today (bounded to a 60-day backfill so a long-dormant cron run can't
-- explode). Department targets fan out to Active/Onboarding members,
-- re-evaluated each run so people who join a department later start
-- receiving the recurring task automatically. Returns the number of new
-- rows created.

CREATE OR REPLACE FUNCTION public.workforce_generate_task_occurrences()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  a record;
  occ date;
  created_total integer := 0;
  ins integer;
BEGIN
  FOR a IN
    SELECT * FROM workforce_task_assignments
    WHERE is_active = true
      AND start_date <= CURRENT_DATE
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  LOOP
    FOR occ IN
      SELECT d::date
      FROM generate_series(
        GREATEST(a.start_date, CURRENT_DATE - INTERVAL '60 days')::date,
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS d
      WHERE CASE a.cadence
        WHEN 'once'    THEN d::date = a.start_date
        WHEN 'daily'   THEN true
        WHEN 'weekly'  THEN EXTRACT(dow FROM d) = EXTRACT(dow FROM a.start_date)
        -- Monthly anchored to start_date's day-of-month, clamped to the
        -- last day for short months (e.g. a 31st anchor fires on Feb 28).
        WHEN 'monthly' THEN EXTRACT(day FROM d) = LEAST(
          EXTRACT(day FROM a.start_date),
          EXTRACT(day FROM (date_trunc('month', d) + INTERVAL '1 month - 1 day'))
        )
        ELSE false
      END
    LOOP
      IF a.target_type = 'employee' THEN
        INSERT INTO workforce_tasks
          (assignment_id, employee_id, occurrence_date, title, description,
           category, cadence, due_date, assigned_by)
        VALUES
          (a.id, a.target_employee_id, occ, a.title, a.description,
           a.category, a.cadence, occ, a.assigned_by)
        ON CONFLICT (assignment_id, employee_id, occurrence_date) DO NOTHING;
        GET DIAGNOSTICS ins = ROW_COUNT;
        created_total := created_total + ins;
      ELSE
        INSERT INTO workforce_tasks
          (assignment_id, employee_id, occurrence_date, title, description,
           category, cadence, due_date, assigned_by)
        SELECT a.id, e.id, occ, a.title, a.description,
               a.category, a.cadence, occ, a.assigned_by
        FROM workforce_employees e
        WHERE e.department = a.target_department
          AND e.status IN ('Active', 'Onboarding')
        ON CONFLICT (assignment_id, employee_id, occurrence_date) DO NOTHING;
        GET DIAGNOSTICS ins = ROW_COUNT;
        created_total := created_total + ins;
      END IF;
    END LOOP;

    UPDATE workforce_task_assignments
      SET last_generated_date = CURRENT_DATE
      WHERE id = a.id;
  END LOOP;

  RETURN created_total;
END;
$$;

-- =============================================================================
-- RLS — admin-only, same shape as the rest of the module
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['workforce_task_assignments', 'workforce_tasks'])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'DROP POLICY IF EXISTS "%1$s_read" ON %1$s;
       CREATE POLICY "%1$s_read" ON %1$s FOR SELECT TO authenticated
       USING (is_workforce_reader());', t
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS "%1$s_write" ON %1$s;
       CREATE POLICY "%1$s_write" ON %1$s FOR ALL TO authenticated
       USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE workforce_task_assignments IS
  'Workforce module — task assignment definitions (employee/department, once/daily/weekly/monthly). RLS: admin-only.';
COMMENT ON TABLE workforce_tasks IS
  'Workforce module — per-employee task instances generated from assignments. RLS: admin-only; employee ownership enforced in the server action.';

-- =============================================================================
-- Schedule the generator (nightly). Guarded so the migration still
-- succeeds in environments where pg_cron can't be enabled — the admin
-- app also calls the function inline on assignment creation.
-- =============================================================================

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  -- 00:05 EAT (UTC+3) → 21:05 UTC. cron.schedule upserts by job name.
  PERFORM cron.schedule(
    'workforce-generate-task-occurrences',
    '5 21 * * *',
    'SELECT public.workforce_generate_task_occurrences();'
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron scheduling skipped (enable pg_cron to auto-generate): %', SQLERRM;
END $$;

NOTIFY pgrst, 'reload schema';
