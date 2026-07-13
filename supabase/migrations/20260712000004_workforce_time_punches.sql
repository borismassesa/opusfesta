-- Workforce — time-clock event log.
--
-- `workforce_attendance` (added in 20260512000004) stores a daily
-- summary with a single clock_in / clock_out time per (employee, day).
-- That's fine for read-only dashboards but it can't represent breaks,
-- multiple shifts, or who/when/where the punch happened — which is
-- exactly what an employee-driven clock-in/out system needs.
--
-- This migration introduces `workforce_time_punches`, an append-only
-- event log: one row per clock-in or clock-out. The daily summary is
-- derived on read (first punch = clock_in, last = clock_out, hours =
-- sum of in→out intervals). The summary table is kept as-is so the
-- existing /workforce/leave attendance view still works; HR can keep
-- editing daily summaries there for manual overrides.
--
-- Surface area:
--   workforce_time_punches              — event log
--   workforce_assert_punch_alternates() — BEFORE INSERT trigger fn
--   workforce_last_punch(employee_id)   — convenience SQL for "are you
--                                          currently clocked in?"
--
-- Access model: same admin-only RLS as the rest of the workforce
-- module (service role bypasses, server actions enforce authz).

-- =============================================================================
-- workforce_time_punches — append-only event log
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_time_punches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  punch_at timestamptz NOT NULL DEFAULT now(),
  punch_type text NOT NULL CHECK (punch_type IN ('in', 'out')),
  source text NOT NULL DEFAULT 'web'
    CHECK (source IN ('web', 'kiosk', 'admin_manual', 'auto_close')),
  ip_address inet,
  user_agent text,
  location_label text,
  note text,
  -- Clerk user id of whoever caused this punch. For self-service punches
  -- this is the employee themselves; for admin_manual punches this is the
  -- admin who edited the timesheet. Text (not uuid) because Clerk ids are
  -- prefixed strings like 'user_…'.
  created_by_clerk_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workforce_time_punches_employee_at
  ON workforce_time_punches (employee_id, punch_at DESC);
CREATE INDEX IF NOT EXISTS idx_workforce_time_punches_at
  ON workforce_time_punches (punch_at DESC);

-- =============================================================================
-- Alternation guard
-- =============================================================================
-- Punches must alternate in/out/in/out per employee, ordered by punch_at.
-- The trigger looks at the punch immediately before the new one in time
-- and rejects same-type sequences ("in" after "in", "out" after "out").
-- An employee's very first punch must be 'in'.
--
-- Why a trigger and not a check constraint: check constraints can't see
-- other rows. We could enforce this purely in application code, but
-- belt-and-braces matters here — a double clock-in inflates worked-hours
-- and corrupts payroll.

CREATE OR REPLACE FUNCTION public.workforce_assert_punch_alternates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  prev_type text;
BEGIN
  -- Find the punch immediately before (or at the same instant as) NEW.
  -- Same-instant ties (extremely rare; would need clock drift on insert)
  -- are resolved by id to keep the ordering deterministic.
  SELECT punch_type
    INTO prev_type
    FROM workforce_time_punches
   WHERE employee_id = NEW.employee_id
     AND id <> NEW.id
     AND (punch_at, id) < (NEW.punch_at, NEW.id)
   ORDER BY punch_at DESC, id DESC
   LIMIT 1;

  IF prev_type IS NULL THEN
    -- First-ever punch for this employee must be a clock-in.
    IF NEW.punch_type <> 'in' THEN
      RAISE EXCEPTION 'first punch for employee % must be clock-in', NEW.employee_id
        USING ERRCODE = 'check_violation';
    END IF;
  ELSIF prev_type = NEW.punch_type THEN
    RAISE EXCEPTION 'punches must alternate: previous punch for employee % was already %',
      NEW.employee_id, prev_type
      USING ERRCODE = 'check_violation';
  END IF;

  -- Also reject any punch that lands *before* the most recent existing
  -- punch — that would invalidate the alternation check for the row
  -- immediately after. Admins editing past entries should delete the
  -- newer punches first.
  IF EXISTS (
    SELECT 1 FROM workforce_time_punches
     WHERE employee_id = NEW.employee_id
       AND id <> NEW.id
       AND (punch_at, id) > (NEW.punch_at, NEW.id)
  ) THEN
    -- Only reject when we'd actually break alternation. If the inserted
    -- punch happens to keep the sequence valid (e.g. backfilling an
    -- earlier 'in' before an existing 'out'), let it through.
    -- We re-check by simulating: find the punch right after NEW.
    DECLARE
      next_type text;
    BEGIN
      SELECT punch_type
        INTO next_type
        FROM workforce_time_punches
       WHERE employee_id = NEW.employee_id
         AND id <> NEW.id
         AND (punch_at, id) > (NEW.punch_at, NEW.id)
       ORDER BY punch_at ASC, id ASC
       LIMIT 1;
      IF next_type = NEW.punch_type THEN
        RAISE EXCEPTION 'inserted punch would duplicate type % at next punch for employee %',
          NEW.punch_type, NEW.employee_id
          USING ERRCODE = 'check_violation';
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workforce_time_punches_alternates ON workforce_time_punches;
CREATE TRIGGER trg_workforce_time_punches_alternates
  BEFORE INSERT OR UPDATE OF punch_type, punch_at, employee_id ON workforce_time_punches
  FOR EACH ROW EXECUTE FUNCTION public.workforce_assert_punch_alternates();

-- =============================================================================
-- workforce_last_punch — convenience read
-- =============================================================================
-- Returns the most-recent punch row for an employee, or no rows if they
-- have never clocked in. Callers check punch_type='in' to know whether
-- the employee is currently on the clock.

CREATE OR REPLACE FUNCTION public.workforce_last_punch(p_employee_id uuid)
RETURNS workforce_time_punches
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT * FROM workforce_time_punches
   WHERE employee_id = p_employee_id
   ORDER BY punch_at DESC, id DESC
   LIMIT 1;
$$;

-- =============================================================================
-- RLS
-- =============================================================================
-- Defensive policy: same shape as the other workforce tables. Server
-- actions go through the service role (RLS-bypass) and enforce permission
-- gates in application code.

ALTER TABLE workforce_time_punches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workforce_time_punches_read" ON workforce_time_punches;
CREATE POLICY "workforce_time_punches_read" ON workforce_time_punches
  FOR SELECT TO authenticated
  USING (is_workforce_reader());

DROP POLICY IF EXISTS "workforce_time_punches_write" ON workforce_time_punches;
CREATE POLICY "workforce_time_punches_write" ON workforce_time_punches
  FOR ALL TO authenticated
  USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());

COMMENT ON TABLE workforce_time_punches IS
  'Workforce module — append-only clock-in/clock-out event log. RLS: admin-only.';
COMMENT ON COLUMN workforce_time_punches.source IS
  'Where the punch came from: web (employee self-service), kiosk (shared device), admin_manual (HR edit), auto_close (nightly job closing forgotten shifts).';
COMMENT ON COLUMN workforce_time_punches.created_by_clerk_id IS
  'Clerk user id of the actor who created this row. Equal to the employee for self-service; equal to the editing admin for admin_manual.';

NOTIFY pgrst, 'reload schema';
