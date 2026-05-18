-- =============================================================================
-- Workforce — employee records (Resume / Skills / Certifications / Badges
-- / Onboarding documents).
-- =============================================================================
-- Adds per-employee child tables that power the detail page tabs so HR and
-- admins can keep a structured record of each teammate's history, skills
-- and onboarding paperwork.
--
-- All tables are owned by `employee_id` with ON DELETE CASCADE so dropping
-- an employee row also drops their child records. RLS reuses the existing
-- `is_workforce_admin()` and `is_workforce_reader()` helpers from the
-- 20260512000004_workforce_module migration so we don't fork that policy
-- model — server actions hitting the service-role client bypass RLS, and
-- HR + admin permissions are gated at the application layer through
-- requirePermission('workforce.write') in actions.ts.
--
-- Onboarding documents intentionally split "what HR sent" from "what's
-- been completed" — a row exists for every required document on every
-- employee, and the status column tracks lifecycle: pending → sent →
-- signed → approved (or rejected). HR uploads the signed copy (V1 stores
-- a storage_path; the bucket itself lands in a separate migration when
-- we wire file uploads).

-- -----------------------------------------------------------------------------
-- Resume entries — work history, education, projects.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workforce_employee_resume_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  entry_type text NOT NULL DEFAULT 'experience'
    CHECK (entry_type IN ('experience', 'education', 'project')),
  title text NOT NULL,
  organization text,
  location text,
  start_date date NOT NULL,
  -- end_date IS NULL means "current" (Present in the timeline).
  end_date date,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS workforce_employee_resume_entries_employee_idx
  ON workforce_employee_resume_entries (employee_id, start_date DESC);

CREATE TRIGGER workforce_employee_resume_entries_updated_at
  BEFORE UPDATE ON workforce_employee_resume_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Skills — categorised proficiency rows (languages, soft skills, technical).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workforce_employee_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  category text NOT NULL
    CHECK (category IN ('language', 'soft', 'technical', 'other')),
  name text NOT NULL,
  level text NOT NULL DEFAULT 'Intermediate'
    CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  -- 0-100 progress bar used in the UI. Levels drive the *label*; the
  -- percent drives the bar fill — they're correlated but stored
  -- independently so admins can tweak the visual without changing the
  -- categorical level.
  proficiency_percent integer NOT NULL DEFAULT 50
    CHECK (proficiency_percent BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- One row per (employee, category, name) — prevents accidentally
  -- listing "English" twice under Languages.
  UNIQUE (employee_id, category, name)
);

CREATE INDEX IF NOT EXISTS workforce_employee_skills_employee_idx
  ON workforce_employee_skills (employee_id);

CREATE TRIGGER workforce_employee_skills_updated_at
  BEFORE UPDATE ON workforce_employee_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Certifications — diplomas, courses, professional certificates.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workforce_employee_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  name text NOT NULL,
  issuing_body text,
  issued_date date,
  -- NULL = no expiry. Expiry tooling (renewal reminders) wires off this
  -- column in a future task.
  expires_date date,
  credential_id text,
  -- Storage column reserved for V2 file uploads — leaving the schema
  -- ready means HR can attach the actual certificate PDF later without
  -- another migration. Nullable so the row works without an attached file.
  storage_path text,
  file_name text,
  file_size_bytes bigint,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_date IS NULL OR issued_date IS NULL OR expires_date >= issued_date)
);

CREATE INDEX IF NOT EXISTS workforce_employee_certifications_employee_idx
  ON workforce_employee_certifications (employee_id);

CREATE TRIGGER workforce_employee_certifications_updated_at
  BEFORE UPDATE ON workforce_employee_certifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Badges — recognition / milestone awards.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workforce_employee_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  -- Free-text kind so HR can coin new award types without a schema change.
  -- The UI groups by this value for filtering.
  badge_kind text NOT NULL,
  name text NOT NULL,
  description text,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  awarded_by uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  -- Tailwind tone token used to colour the badge pill (e.g. 'emerald',
  -- 'purple', 'amber'). Falls back to 'purple' on the client when null.
  color_token text
);

CREATE INDEX IF NOT EXISTS workforce_employee_badges_employee_idx
  ON workforce_employee_badges (employee_id, awarded_at DESC);

-- -----------------------------------------------------------------------------
-- Onboarding documents — per-employee tracker of forms HR sent + their
-- review status. The standard set is auto-created when an employee row
-- lands so HR sees a "checklist" the moment they open the new hire's
-- profile.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workforce_employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  -- doc_type is a stable identifier (e.g. 'employment_contract'). doc_label
  -- is the human-facing string HR can rename. Together they let HR rename
  -- a doc without changing the type code we filter by.
  doc_type text NOT NULL,
  doc_label text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'signed', 'approved', 'rejected')),
  required boolean NOT NULL DEFAULT true,
  sent_at timestamptz,
  signed_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  -- File path in a (future) workforce_employee_files storage bucket.
  -- Same V2 pattern as certifications.storage_path.
  storage_path text,
  file_name text,
  file_size_bytes bigint,
  rejection_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workforce_employee_documents_employee_idx
  ON workforce_employee_documents (employee_id, status);

CREATE TRIGGER workforce_employee_documents_updated_at
  BEFORE UPDATE ON workforce_employee_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------------------------------
-- RLS — reuse the existing workforce helpers. Service-role bypasses these
-- (admin queries / actions go through createSupabaseAdminClient), so the
-- effective gate is requirePermission('workforce.write') in actions.ts.
-- The policies still matter for any future direct-client read flow.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'workforce_employee_resume_entries',
    'workforce_employee_skills',
    'workforce_employee_certifications',
    'workforce_employee_badges',
    'workforce_employee_documents'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format(
      'DROP POLICY IF EXISTS "workforce_read" ON %I;
       CREATE POLICY "workforce_read" ON %I FOR SELECT TO authenticated
       USING (is_workforce_reader());', t, t
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS "workforce_write" ON %I;
       CREATE POLICY "workforce_write" ON %I FOR ALL TO authenticated
       USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());', t, t
    );
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- Default onboarding-doc checklist — auto-seed on new employee insert.
-- Trigger fires AFTER INSERT so existing rows are untouched (we backfill
-- below for completeness).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.workforce_seed_employee_documents()
RETURNS TRIGGER
LANGUAGE plpgsql
-- Pin search_path so the unqualified workforce_employee_documents insert
-- resolves predictably (Supabase advisor flags any mutable search_path).
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO workforce_employee_documents (employee_id, doc_type, doc_label, status, required)
  VALUES
    (NEW.id, 'employment_contract', 'Employment Contract',     'pending', true),
    (NEW.id, 'nda',                 'Non-Disclosure Agreement', 'pending', true),
    (NEW.id, 'code_of_conduct',     'Code of Conduct',          'pending', true),
    (NEW.id, 'ip_assignment',       'IP Assignment Agreement',  'pending', true),
    (NEW.id, 'tax_form',            'Tax Form / TIN Copy',      'pending', true),
    (NEW.id, 'id_copy',             'Government ID Copy',       'pending', true),
    (NEW.id, 'bank_details',        'Bank / Mobile Money Details', 'pending', true)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workforce_employees_seed_documents ON workforce_employees;
CREATE TRIGGER workforce_employees_seed_documents
  AFTER INSERT ON workforce_employees
  FOR EACH ROW EXECUTE FUNCTION public.workforce_seed_employee_documents();

-- Backfill: ensure every existing employee has the default checklist so
-- HR doesn't have to re-add docs by hand. Idempotent — runs the same
-- INSERT pattern but guards each row.
INSERT INTO workforce_employee_documents (employee_id, doc_type, doc_label, status, required)
SELECT e.id, d.doc_type, d.doc_label, 'pending'::text, true
FROM workforce_employees e
CROSS JOIN (VALUES
  ('employment_contract', 'Employment Contract'),
  ('nda',                 'Non-Disclosure Agreement'),
  ('code_of_conduct',     'Code of Conduct'),
  ('ip_assignment',       'IP Assignment Agreement'),
  ('tax_form',            'Tax Form / TIN Copy'),
  ('id_copy',             'Government ID Copy'),
  ('bank_details',        'Bank / Mobile Money Details')
) AS d(doc_type, doc_label)
WHERE NOT EXISTS (
  SELECT 1 FROM workforce_employee_documents wd
  WHERE wd.employee_id = e.id AND wd.doc_type = d.doc_type
);

NOTIFY pgrst, 'reload schema';
