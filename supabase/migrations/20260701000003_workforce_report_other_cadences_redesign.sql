-- Extend the monthly-report redesign (20260701000002) to the other seeded
-- cadences, so every report type gets the same accountability loop and
-- structured fields instead of freeform text:
--   - follow_up (followup_list) carried forward from last period's goals
--   - achievements-equivalent field made required (metrics stay optional)
--   - blockers as a structured blocker_list (waiting on + since)
--   - next-period goals as a structured goal_list (owner + target date)
--   - placeholder example text on the required fields
-- Daily cadences keep their lighter shape (no cross-period follow-up loop —
-- day-to-day work doesn't carry "priorities" the same way weekly+ does) but
-- get the same blocker_list treatment and placeholders.

UPDATE report_templates
SET sections = '[
    {"id":"follow_up","title":"Follow-up on last week''s focus","type":"followup_list",
     "followsSectionId":"next","required":false,
     "help":"Carried forward from last week''s \"Focus next week\" list — mark each Done, Partially Done, or Not Done."},
    {"id":"highlights","title":"Highlights","type":"text","required":true,
     "help":"The headline of your week.",
     "placeholder":"e.g., Shipped the new landing page and closed 3 vendor deals"},
    {"id":"completed","title":"Completed this week","type":"bullets","required":true,
     "placeholder":"e.g., Finalized the Q3 vendor contract"},
    {"id":"in_progress","title":"In progress","type":"bullets","required":false,
     "placeholder":"e.g., Drafting the September campaign brief"},
    {"id":"blockers","title":"Blockers","type":"blocker_list","required":false,
     "help":"Anything stuck waiting on another person, team, or approval."},
    {"id":"next","title":"Focus next week","type":"goal_list","required":false,
     "help":"Specific, dated priorities — these carry forward into next week''s follow-up."}
  ]'::jsonb
WHERE slug = 'weekly-report';

UPDATE report_templates
SET sections = '[
    {"id":"follow_up","title":"Follow-up on last period''s focus","type":"followup_list",
     "followsSectionId":"next","required":false,
     "help":"Carried forward from last period''s \"Focus next two weeks\" list — mark each Done, Partially Done, or Not Done."},
    {"id":"summary","title":"Summary","type":"text","required":true,
     "placeholder":"e.g., Closed the vendor renewal cycle and onboarded 2 new hires"},
    {"id":"completed","title":"Completed","type":"bullets","required":true,
     "placeholder":"e.g., Migrated the booking flow to the new pricing model"},
    {"id":"in_progress","title":"In progress","type":"bullets","required":false},
    {"id":"blockers","title":"Blockers","type":"blocker_list","required":false},
    {"id":"next","title":"Focus next two weeks","type":"goal_list","required":false}
  ]'::jsonb
WHERE slug = 'biweekly-report';

UPDATE report_templates
SET sections = '[
    {"id":"follow_up","title":"Follow-up on last quarter''s goals","type":"followup_list",
     "followsSectionId":"goals","required":false,
     "help":"Carried forward from last quarter''s goals — mark each Done, Partially Done, or Not Done, with a one-line reason if it wasn''t fully done."},
    {"id":"summary","title":"Executive summary","type":"text","required":true,
     "placeholder":"e.g., Grew active vendors 18% and launched the new booking flow"},
    {"id":"achievements","title":"Major achievements","type":"bullets","required":true,
     "placeholder":"e.g., Closed the pre-seed round and hit 500 bookings"},
    {"id":"challenges","title":"Challenges & learnings","type":"bullets","required":true,
     "placeholder":"e.g., Underestimated vendor onboarding time by 2 weeks"},
    {"id":"kpis","title":"KPIs & metrics","type":"metrics_table","required":false,
     "help":"Report the same KPIs every quarter so progress is comparable over time."},
    {"id":"blockers","title":"Blockers / what we need help with","type":"blocker_list","required":false},
    {"id":"goals","title":"Goals for next quarter","type":"goal_list","required":false}
  ]'::jsonb
WHERE slug = 'quarterly-report';

UPDATE report_templates
SET sections = '[
    {"id":"summary","title":"What did you work on?","type":"text","required":true,
     "help":"Tasks you completed, progress made, anything notable.",
     "placeholder":"e.g., Finished the vendor onboarding checklist and replied to 12 inquiries"},
    {"id":"blockers","title":"Blockers","type":"blocker_list","required":false,
     "help":"Anything slowing you down or needing follow-up."},
    {"id":"hours","title":"Hours worked","type":"number","required":false}
  ]'::jsonb
WHERE slug = 'general-daily-report';

UPDATE report_templates
SET sections = '[
    {"id":"introduction","title":"Introduction","type":"text","required":true,
     "help":"Summary of the day''s goals and outcomes.",
     "placeholder":"e.g., Focused on outreach to venue and catering vendors in Mbezi"},
    {"id":"meeting_notes","title":"Meeting Notes","type":"bullets","required":false,
     "help":"Stand-ups, agendas, key discussions.",
     "placeholder":"e.g., Weekly stand-up — aligned on the September campaign timeline"},
    {"id":"vendor_outreach","title":"New Vendor Outreach","type":"grouped_bullets","required":false,
     "groups":[
       {"id":"contract","label":"Contract Agreement"},
       {"id":"positive","label":"Positive Response"},
       {"id":"awaiting","label":"Awaiting Office Visit / Confirmation"},
       {"id":"no_response","label":"No Response"}
     ]},
    {"id":"follow_up","title":"Follow-Up on Previous Vendors","type":"bullets","required":false,
     "help":"Updates on vendors contacted earlier.",
     "placeholder":"e.g., Venue X confirmed their contract, awaiting signature"},
    {"id":"conclusion","title":"Conclusion","type":"text","required":false,
     "help":"Overall summary and next steps."}
  ]'::jsonb
WHERE slug = 'marketing-daily-report';

NOTIFY pgrst, 'reload schema';
