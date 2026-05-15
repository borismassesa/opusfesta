-- Seed data — gives the dashboard something to render on a fresh
-- install without requiring admins to populate every table by hand
-- before they can evaluate the layout.
--
-- Idempotency contract:
--   - intern_tasks: per-employee seed only fires when that employee
--     has zero existing tasks. Re-running the migration on a DB with
--     manually-added tasks won't bury or duplicate them.
--   - partnership_leads: only seeds when the table is empty. Once
--     real data lands, this block is a no-op.
--
-- Why a separate migration: keeps the schema migrations (000001 →
-- 000003) replayable on prod without dragging seed data along. If a
-- team wants the schema but not the demo rows, they can skip this one.

-- =============================================================================
-- intern_tasks — onboarding checklist for any employee in 'Onboarding'
-- =============================================================================
-- For each onboarding employee with no existing tasks, insert a small
-- starter checklist. The titles are deliberately generic so they read
-- well across all departments.

DO $$
DECLARE
  emp RECORD;
BEGIN
  FOR emp IN
    SELECT id, full_name, department
    FROM workforce_employees
    WHERE status = 'Onboarding'
      AND NOT EXISTS (
        SELECT 1 FROM intern_tasks t WHERE t.employee_id = workforce_employees.id
      )
  LOOP
    INSERT INTO intern_tasks (employee_id, title, description, category, due_date, status)
    VALUES
      (emp.id,
       'Read the OpusFesta brand brief',
       'Skim the brand identity doc on Drive — focus on tone of voice and the Emerald Principle.',
       'Reading',
       CURRENT_DATE + 2,
       'Todo'),
      (emp.id,
       'Set up your admin dashboard profile',
       'Add a photo, confirm your role, and make sure your timezone is set.',
       'Onboarding',
       CURRENT_DATE + 1,
       'Todo'),
      (emp.id,
       'Shadow one vendor onboarding call',
       'Sit in with Operations on a vendor verification call this week.',
       'Shadowing',
       CURRENT_DATE + 7,
       'Todo'),
      (emp.id,
       'Read three "wedding traditions" articles',
       'Pick any three from the Advice library — get a sense of our editorial voice.',
       'Reading',
       CURRENT_DATE + 5,
       'Todo'),
      (emp.id,
       'Map the platform — explore each top-level section',
       'Walk through Operations, Workforce, Finance, Insights, CMS. Note anything confusing.',
       'Onboarding',
       CURRENT_DATE + 3,
       'In Progress'),
      (emp.id,
       'Sync with your team lead',
       'Book a 30-min intro with whoever owns ' || emp.department || '.',
       'Admin',
       CURRENT_DATE,
       'Todo');
  END LOOP;
END $$;

-- =============================================================================
-- partnership_leads — illustrative pipeline rows
-- =============================================================================
-- Only seeds if the table is empty. Once a real lead lands the seed
-- becomes a no-op forever.

INSERT INTO partnership_leads
  (contact_name, contact_email, contact_phone, company_name, lead_type, status, source, notes, last_activity_at)
SELECT *
FROM (VALUES
  ('Naila Mahmoud',  'naila@silkthread.tz',     '+255-712-345-678', 'Silk Thread Atelier',   'Vendor',     'New',         'Web form', 'Bridal couture studio in Oyster Bay — interested in a co-marketing feature.', now() - interval '6 hours'),
  ('Joseph Mwangi',  'jmwangi@safarisuites.co', '+254-722-980-145', 'Safari Suites Kenya',   'Brand',      'Contacted',   'Email',    'Potential cross-border honeymoon partnership. Awaiting their commercial deck.',  now() - interval '3 days'),
  ('Aisha Karim',    'aisha@karimphoto.com',    NULL,                NULL,                    'Influencer', 'Negotiating', 'Outreach', 'Wedding photographer with 80k IG followers; discussing affiliate terms.',         now() - interval '1 day'),
  ('Tom Sebahizi',   'tom@rivieraproductions.tz', NULL,              'Riviera Productions',   'Agency',     'Contacted',   'Referral', 'Production agency that handles vendor video shoots — Q3 collaboration?',          now() - interval '8 days')
) AS v(contact_name, contact_email, contact_phone, company_name, lead_type, status, source, notes, last_activity_at)
WHERE NOT EXISTS (SELECT 1 FROM partnership_leads LIMIT 1);

NOTIFY pgrst, 'reload schema';
