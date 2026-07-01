-- Consolidate the two overlapping daily templates ("General Daily Report"
-- and the just-introduced "Department Daily Report") into a single
-- "Department Report": same daily cadence (shown via the existing DAILY
-- pill), but the name drops the redundant "Daily", and it gets the
-- department_select picker plus the general-daily-report's fuller content
-- (hours worked). No submissions existed yet against the short-lived
-- "Department Daily Report" row, so it's safe to drop outright.

DELETE FROM report_templates WHERE slug = 'department-daily-report';

UPDATE report_templates
SET
  slug = 'department-report',
  name = 'Department Report',
  description = 'A daily update for any department — pick which one it''s about.',
  sections = '[
    {"id":"department","title":"Department","type":"department_select","required":true,
     "help":"Which department is this update about?"},
    {"id":"summary","title":"What did you work on today?","type":"text","required":true,
     "help":"Tasks you completed, progress made, anything notable.",
     "placeholder":"e.g., Finished the vendor onboarding checklist and replied to 12 inquiries"},
    {"id":"key_updates","title":"Key updates","type":"bullets","required":false,
     "help":"Notable wins, meetings, or progress today.",
     "placeholder":"e.g., Confirmed the venue partnership for October"},
    {"id":"blockers","title":"Blockers","type":"blocker_list","required":false,
     "help":"Anything slowing you down or needing follow-up."},
    {"id":"hours","title":"Hours worked","type":"number","required":false},
    {"id":"conclusion","title":"Notes / next steps","type":"text","required":false,
     "help":"Anything to flag for tomorrow."}
  ]'::jsonb
WHERE slug = 'general-daily-report';

NOTIFY pgrst, 'reload schema';
