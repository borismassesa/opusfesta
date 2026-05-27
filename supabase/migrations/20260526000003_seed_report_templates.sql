-- Starter report templates for the non-daily cadences, so the picker
-- offers the full frequency range out of the box (Daily already covered by
-- General Daily Report + Marketing Daily Report). All are unrestricted
-- (every department) and fully editable/removable in /workforce/report-templates.

INSERT INTO report_templates (slug, name, description, cadence, departments, sections)
VALUES
(
  'weekly-report',
  'Weekly Report',
  'End-of-week summary of progress and focus.',
  'weekly',
  ARRAY[]::text[],
  '[
    {"id":"highlights","title":"Highlights","type":"text","required":true,
     "help":"The headline of your week."},
    {"id":"completed","title":"Completed this week","type":"bullets","required":false},
    {"id":"in_progress","title":"In progress","type":"bullets","required":false},
    {"id":"blockers","title":"Blockers","type":"text","required":false},
    {"id":"next","title":"Focus next week","type":"bullets","required":false}
  ]'::jsonb
),
(
  'biweekly-report',
  'Biweekly Report',
  'Two-week progress summary.',
  'biweekly',
  ARRAY[]::text[],
  '[
    {"id":"summary","title":"Summary","type":"text","required":true},
    {"id":"completed","title":"Completed","type":"bullets","required":false},
    {"id":"in_progress","title":"In progress","type":"bullets","required":false},
    {"id":"blockers","title":"Blockers","type":"text","required":false},
    {"id":"next","title":"Focus next two weeks","type":"bullets","required":false}
  ]'::jsonb
),
(
  'monthly-report',
  'Monthly Report',
  'Monthly achievements, metrics and goals.',
  'monthly',
  ARRAY[]::text[],
  '[
    {"id":"summary","title":"Summary","type":"text","required":true},
    {"id":"achievements","title":"Key achievements","type":"bullets","required":false},
    {"id":"metrics","title":"Metrics & numbers","type":"text","required":false},
    {"id":"challenges","title":"Challenges","type":"text","required":false},
    {"id":"goals","title":"Goals for next month","type":"bullets","required":false}
  ]'::jsonb
),
(
  'quarterly-report',
  'Quarterly Report',
  'Quarterly review of outcomes and priorities.',
  'quarterly',
  ARRAY[]::text[],
  '[
    {"id":"summary","title":"Executive summary","type":"text","required":true},
    {"id":"achievements","title":"Major achievements","type":"bullets","required":false},
    {"id":"kpis","title":"KPIs & metrics","type":"text","required":false},
    {"id":"challenges","title":"Challenges & learnings","type":"text","required":false},
    {"id":"goals","title":"Goals for next quarter","type":"bullets","required":false}
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';
