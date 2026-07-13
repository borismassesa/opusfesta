-- Replace the Marketing-only daily report with a generic Department Daily
-- Report any employee can use — the author picks which department the
-- update is about (via the new department_select field type) instead of
-- the template being hard-restricted to one department. Content is
-- rewritten to drop the Marketing-specific vendor-outreach fields in favor
-- of generic daily-update fields, matching the plain shape of the other
-- redesigned templates (placeholders, structured blocker_list).

UPDATE report_templates
SET
  slug = 'department-daily-report',
  name = 'Department Daily Report',
  description = 'A daily update for any department — pick which one it''s about.',
  departments = ARRAY[]::text[],
  sections = '[
    {"id":"department","title":"Department","type":"department_select","required":true,
     "help":"Which department is this update about?"},
    {"id":"summary","title":"What did you work on today?","type":"text","required":true,
     "help":"Summary of the day''s goals and outcomes.",
     "placeholder":"e.g., Followed up with 4 vendors and prepped the weekly newsletter"},
    {"id":"key_updates","title":"Key updates","type":"bullets","required":false,
     "help":"Notable wins, meetings, or progress today.",
     "placeholder":"e.g., Confirmed the venue partnership for October"},
    {"id":"blockers","title":"Blockers","type":"blocker_list","required":false,
     "help":"Anything stuck waiting on another person, team, or approval."},
    {"id":"conclusion","title":"Notes / next steps","type":"text","required":false,
     "help":"Anything to flag for tomorrow."}
  ]'::jsonb
WHERE slug = 'marketing-daily-report';

NOTIFY pgrst, 'reload schema';
