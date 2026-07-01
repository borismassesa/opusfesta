-- Reports gained a "submit to" step: the employee picks who on the team
-- should receive/review the report (e.g. their manager, a department
-- head). Optional at the DB level (drafts can be unaddressed); the app
-- layer requires it before a report can move to 'submitted'.

ALTER TABLE workforce_reports
  ADD COLUMN IF NOT EXISTS recipient_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_workforce_reports_recipient
  ON workforce_reports (recipient_id);

COMMENT ON COLUMN workforce_reports.recipient_id IS
  'Who the report is submitted to — a workforce_employees id chosen by the author.';

NOTIFY pgrst, 'reload schema';
