-- Expand report-template cadence options to the set the team uses:
-- daily, weekly, biweekly, monthly, quarterly. Drops the previous
-- 'any'/'once' values (cadence on a report is a frequency label only —
-- it groups/labels report types and decides whether a period-end date is
-- collected; it does not drive any generation).

ALTER TABLE report_templates
  DROP CONSTRAINT IF EXISTS report_templates_cadence_check;

ALTER TABLE report_templates
  ALTER COLUMN cadence SET DEFAULT 'daily';

ALTER TABLE report_templates
  ADD CONSTRAINT report_templates_cadence_check
  CHECK (cadence IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly'));

NOTIFY pgrst, 'reload schema';
