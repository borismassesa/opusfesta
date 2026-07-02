-- An engine can have more than one MD (e.g. co-leads). Replace the single
-- md_employee_id FK with an array column so the daily tracker can assign
-- multiple people; acting_md_employee_id is unaffected (still a single
-- temporary stand-in).

ALTER TABLE md_tracker_engines
  ADD COLUMN IF NOT EXISTS md_employee_ids uuid[] NOT NULL DEFAULT '{}';

UPDATE md_tracker_engines
SET md_employee_ids = ARRAY[md_employee_id]
WHERE md_employee_id IS NOT NULL;

ALTER TABLE md_tracker_engines DROP COLUMN IF EXISTS md_employee_id;

COMMENT ON COLUMN md_tracker_engines.md_employee_ids IS
  'workforce_employees ids assigned as MD for this engine — supports co-MDs.';

NOTIFY pgrst, 'reload schema';
