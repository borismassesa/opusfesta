-- Report templates — a multi-type report system. Admins define report
-- types (templates) and their sections in the UI; employees pick a type
-- from a picker and fill it in; admins track submissions. Supersedes the
-- single-purpose workforce_daily_reports table (which shipped empty).
--
-- Backs:
--   /workforce/report-templates — admin template builder
--   /me/reports                 — employee picker + dynamic form + history
--   /workforce/reports          — admin tracking + branded view
--
-- Two tables:
--   report_templates  — the definition (name, scope, ordered sections)
--   workforce_reports — a submission against a template, with a frozen
--                       snapshot of the template's sections so old reports
--                       still render after the template is later edited
--
-- Section field types (stored in report_templates.sections jsonb):
--   text            → string          (free-text block, e.g. Introduction)
--   short_text      → string          (one-line field)
--   number          → number          (e.g. hours worked)
--   bullets         → string[]        (a bullet list, e.g. Meeting Notes)
--   grouped_bullets → {groupId:[...]} (named groups, auto-counted headings
--                                       e.g. "Positive Response (3)")
--
-- Access model mirrors the rest of the workforce module: service role
-- (admin app) bypasses RLS and enforces authz in server actions; the RLS
-- policies are belt-and-braces (reader SELECT, admin mutate). Employee
-- "edit my own draft" is enforced in the server action by an employee_id
-- == caller match.

-- =============================================================================
-- report_templates — the definitions
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  description text,
  cadence text NOT NULL DEFAULT 'any'
    CHECK (cadence IN ('any', 'once', 'daily', 'weekly', 'monthly')),
  -- Empty array = available to every department. Otherwise the picker only
  -- offers this template to employees in one of the listed departments.
  departments text[] NOT NULL DEFAULT '{}',
  -- Ordered array of section definitions. See header for the field-type
  -- contract. Validated in the app layer, not the DB (house convention).
  sections jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_templates_active
  ON report_templates (is_active) WHERE is_active;

-- =============================================================================
-- workforce_reports — submissions
-- =============================================================================

CREATE TABLE IF NOT EXISTS workforce_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- SET NULL (not CASCADE) so deleting a template never destroys history;
  -- template_snapshot carries the schema needed to still render the report.
  template_id uuid REFERENCES report_templates(id) ON DELETE SET NULL,
  template_snapshot jsonb NOT NULL DEFAULT '{}',
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  -- Optional end of the covered period for weekly/monthly reports.
  period_end date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  -- Filled-in values keyed by section id (shape depends on the section type).
  content jsonb NOT NULL DEFAULT '{}',
  -- Snapshotted at submit for the "Prepared by … / role" letterhead block.
  prepared_by_name text,
  prepared_by_role text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, employee_id, report_date)
);

CREATE INDEX IF NOT EXISTS idx_workforce_reports_employee
  ON workforce_reports (employee_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_workforce_reports_template
  ON workforce_reports (template_id);
CREATE INDEX IF NOT EXISTS idx_workforce_reports_date
  ON workforce_reports (report_date DESC);
CREATE INDEX IF NOT EXISTS idx_workforce_reports_status
  ON workforce_reports (status);

-- =============================================================================
-- updated_at triggers
-- =============================================================================

DROP TRIGGER IF EXISTS trg_report_templates_updated_at ON report_templates;
CREATE TRIGGER trg_report_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_workforce_reports_updated_at ON workforce_reports;
CREATE TRIGGER trg_workforce_reports_updated_at
  BEFORE UPDATE ON workforce_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- RLS — admin-only, same shape as the rest of the module
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['report_templates', 'workforce_reports'])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'DROP POLICY IF EXISTS "%1$s_read" ON %1$s;
       CREATE POLICY "%1$s_read" ON %1$s FOR SELECT TO authenticated
       USING (is_workforce_reader());', t
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS "%1$s_write" ON %1$s;
       CREATE POLICY "%1$s_write" ON %1$s FOR ALL TO authenticated
       USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());', t
    );
  END LOOP;
END $$;

-- =============================================================================
-- Seed: Marketing Daily Report (from the company .docx) + General Daily Report
-- =============================================================================

INSERT INTO report_templates (slug, name, description, cadence, departments, sections)
VALUES
(
  'marketing-daily-report',
  'Marketing Daily Report',
  'Daily vendor & partnership outreach report.',
  'daily',
  ARRAY['Marketing & Partnership'],
  '[
    {"id":"introduction","title":"Introduction","type":"text","required":true,
     "help":"Summary of the day''s goals and outcomes."},
    {"id":"meeting_notes","title":"Meeting Notes","type":"bullets","required":false,
     "help":"Stand-ups, agendas, key discussions."},
    {"id":"vendor_outreach","title":"New Vendor Outreach","type":"grouped_bullets","required":false,
     "groups":[
       {"id":"contract","label":"Contract Agreement"},
       {"id":"positive","label":"Positive Response"},
       {"id":"awaiting","label":"Awaiting Office Visit / Confirmation"},
       {"id":"no_response","label":"No Response"}
     ]},
    {"id":"follow_up","title":"Follow-Up on Previous Vendors","type":"bullets","required":false,
     "help":"Updates on vendors contacted earlier."},
    {"id":"conclusion","title":"Conclusion","type":"text","required":false,
     "help":"Overall summary and next steps."}
  ]'::jsonb
),
(
  'general-daily-report',
  'General Daily Report',
  'A simple end-of-day log of what you worked on.',
  'daily',
  ARRAY[]::text[],
  '[
    {"id":"summary","title":"What did you work on?","type":"text","required":true,
     "help":"Tasks you completed, progress made, anything notable."},
    {"id":"blockers","title":"Blockers","type":"text","required":false,
     "help":"Anything slowing you down or needing follow-up."},
    {"id":"hours","title":"Hours worked","type":"number","required":false}
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE report_templates IS
  'Workforce module — admin-authored report type definitions (sections in jsonb). RLS: admin-only.';
COMMENT ON TABLE workforce_reports IS
  'Workforce module — report submissions against a template, with a frozen template_snapshot. RLS: admin-only; employee ownership enforced in the server action.';

-- =============================================================================
-- Retire the single-purpose daily report table (shipped empty, now
-- superseded by report_templates + workforce_reports).
-- =============================================================================

DROP TABLE IF EXISTS workforce_daily_reports;

NOTIFY pgrst, 'reload schema';
