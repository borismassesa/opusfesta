-- Two additions driven by a review of the company's .docx Monthly Report
-- Template against the digital report builder:
--
-- 1. Reports can now also be emailed out on submit — to the internal
--    "submit to" recipient's address (already has recipient_id) AND/OR any
--    extra addresses the author types in (e.g. the Managing Director's
--    inbox even if they're not a workforce_employees row). Both are
--    optional; email dispatch itself happens in the app layer.
--
-- 2. The seeded Monthly Report template is redesigned to match the docx
--    template's 6-section structure: a follow-up-on-last-month's-goals
--    section (accountability loop), achievements/challenges split from a
--    single "challenges" field into "what went well" + "what didn't go
--    well" + a separate actionable "blockers" list, a structured metrics
--    table instead of freeform text, and owner/target-date fields on next
--    month's goals. See report-schema.ts for the new field-type shapes
--    (metrics_table, goal_list, blocker_list, followup_list).

ALTER TABLE workforce_reports
  ADD COLUMN IF NOT EXISTS recipient_emails text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN workforce_reports.recipient_emails IS
  'Extra email addresses (beyond recipient_id) the PDF report gets sent to on submit.';

UPDATE report_templates
SET
  description = 'Monthly department report — achievements, metrics, blockers, and next month''s goals.',
  sections = '[
    {"id":"follow_up","title":"Follow-up on last month''s priorities","type":"followup_list",
     "followsSectionId":"goals_next_month","required":false,
     "help":"Carried forward from last month''s goals — mark each Done, Partially Done, or Not Done, and give a one-line reason if it wasn''t fully done. This section keeps the team accountable across months; do not skip it, even if the answer is uncomfortable."},
    {"id":"achievements","title":"What went well","type":"bullets","required":true,
     "help":"Wins, completed milestones, and things that worked better than expected. Be specific — name the achievement, not just the general area.",
     "placeholder":"e.g., Closed 2 vendor contracts, launched the Instagram campaign, hit 110% of the sales target"},
    {"id":"challenges","title":"What didn''t go well","type":"bullets","required":true,
     "help":"Missed targets, delays, or mistakes. State them plainly — do not soften or bury the issue. Honest reporting here helps the whole company improve.",
     "placeholder":"e.g., Missed the print deadline for the March batch by 3 days"},
    {"id":"metrics","title":"Key metrics / numbers","type":"metrics_table","required":false,
     "help":"Report the same metrics every month so progress is comparable over time. Add more rows as needed for metrics specific to your department."},
    {"id":"blockers","title":"Blockers / what we need help with","type":"blocker_list","required":false,
     "help":"Anything stuck waiting on another department, a budget decision, or approval from leadership. Name who or what you''re waiting on."},
    {"id":"goals_next_month","title":"What we''re focusing on next month","type":"goal_list","required":false,
     "help":"Specific, dated priorities, not vague intentions. Each item should have a clear owner and a deadline within next month. These carry forward into next month''s follow-up section."}
  ]'::jsonb
WHERE slug = 'monthly-report';

NOTIFY pgrst, 'reload schema';
