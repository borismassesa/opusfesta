-- Rename "Department Report" back to "Daily Report" — the department
-- picker inside the form is what lets the employee say which department
-- it's about, so the template name itself doesn't need the word.

UPDATE report_templates
SET
  slug = 'daily-report',
  name = 'Daily Report',
  description = 'A daily update — pick which department it''s about.'
WHERE slug = 'department-report';

NOTIFY pgrst, 'reload schema';
