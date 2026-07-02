-- Closes several gaps in the MD Daily Tracker:
--   1. Per-engine review (was one reviewed_by flag for the whole week —
--      a CEO couldn't review OpusFesta without also implicitly reviewing
--      OpusStudio/OpusPass, and there was no way to undo a mistaken mark).
--   2. Per-engine "works Saturdays" toggle, so a unit that doesn't work
--      weekends doesn't get flagged "missed" for a day it was never due.
-- md_tracker_entries.updated_by_employee_id already exists (workforce_module
-- migration) — no change needed there, just newly surfaced in the UI.

ALTER TABLE md_tracker_week_reviews
  ADD COLUMN IF NOT EXISTS reviewed_by_employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE md_tracker_engines
  ADD COLUMN IF NOT EXISTS works_saturday boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN md_tracker_week_reviews.reviewed_by_employee_id IS
  'Per-engine review mark — replaces the old whole-week md_tracker_weeks.reviewed_by_employee_id flag.';
COMMENT ON COLUMN md_tracker_engines.works_saturday IS
  'When false, Saturday is excluded from this engine''s day cards, matrix column, and missed/progress counts.';

NOTIFY pgrst, 'reload schema';
