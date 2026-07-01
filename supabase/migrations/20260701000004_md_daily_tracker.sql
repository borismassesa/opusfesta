-- MD Daily Tracker — replaces the manual "OpusFesta_MD_Daily_Tracker.xlsx"
-- weekly spreadsheet with a structured, permissioned feature. Each engine
-- (OpusFesta, OpusStudio, OpusPass) logs a top priority + other tasks +
-- status + blockers + end-of-day note for every Mon–Sat workday, and closes
-- each week with a per-engine review (wins / carried over / CEO comment).
--
-- Backs: /workforce/daily-tracker
--
-- Four tables:
--   md_tracker_engines      — the 3 fixed engines + their MD/acting-MD
--   md_tracker_weeks        — one row per ISO week (Mon–Sat), created lazily
--   md_tracker_entries      — one row per (week, engine, day)
--   md_tracker_week_reviews — one row per (week, engine) — the review block
--
-- Access model mirrors the rest of the workforce module: service role
-- (admin app) bypasses RLS and enforces authz in server actions — each MD
-- can only write their own engine's rows (md_tracker.<engine>.write), the
-- CEO/owner reviews via md_tracker.review. RLS below is belt-and-braces
-- (reader SELECT, admin mutate), same shape as report_templates /
-- workforce_reports in 20260526000001_workforce_report_templates.sql.

-- =============================================================================
-- md_tracker_engines
-- =============================================================================

CREATE TABLE IF NOT EXISTS md_tracker_engines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  sort_order int NOT NULL DEFAULT 0,
  md_employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  acting_md_employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- md_tracker_weeks
-- =============================================================================

CREATE TABLE IF NOT EXISTS md_tracker_weeks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start date NOT NULL UNIQUE, -- Monday
  week_end date NOT NULL,          -- Saturday
  reviewed_by_employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- md_tracker_entries
-- =============================================================================

CREATE TABLE IF NOT EXISTS md_tracker_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id uuid NOT NULL REFERENCES md_tracker_weeks(id) ON DELETE CASCADE,
  engine_id uuid NOT NULL REFERENCES md_tracker_engines(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  top_priority text NOT NULL DEFAULT '',
  other_tasks text NOT NULL DEFAULT '',
  status text CHECK (status IN ('Planned', 'In Progress', 'Done', 'Carried Over', 'Blocked')),
  blockers text NOT NULL DEFAULT '',
  end_of_day_note text NOT NULL DEFAULT '',
  updated_by_employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_id, engine_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_md_tracker_entries_week
  ON md_tracker_entries (week_id);
CREATE INDEX IF NOT EXISTS idx_md_tracker_entries_engine_date
  ON md_tracker_entries (engine_id, entry_date DESC);

-- =============================================================================
-- md_tracker_week_reviews
-- =============================================================================

CREATE TABLE IF NOT EXISTS md_tracker_week_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id uuid NOT NULL REFERENCES md_tracker_weeks(id) ON DELETE CASCADE,
  engine_id uuid NOT NULL REFERENCES md_tracker_engines(id) ON DELETE CASCADE,
  wins text NOT NULL DEFAULT '',
  carried_to_next_week text NOT NULL DEFAULT '',
  ceo_comment text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_id, engine_id)
);

-- =============================================================================
-- updated_at triggers
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'md_tracker_engines', 'md_tracker_weeks', 'md_tracker_entries', 'md_tracker_week_reviews'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON %1$s;
       CREATE TRIGGER trg_%1$s_updated_at
         BEFORE UPDATE ON %1$s
         FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t
    );
  END LOOP;
END $$;

-- =============================================================================
-- RLS — admin-only, same shape as the rest of the module
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'md_tracker_engines', 'md_tracker_weeks', 'md_tracker_entries', 'md_tracker_week_reviews'
  ])
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
-- Seed: the 3 engines
-- =============================================================================

INSERT INTO md_tracker_engines (slug, name, sort_order)
VALUES
  ('opusfesta', 'OpusFesta', 1),
  ('opusstudio', 'OpusStudio', 2),
  ('opuspass', 'OpusPass', 3)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE md_tracker_engines IS
  'MD Daily Tracker — the 3 fixed engines and their MD / acting-MD. RLS: admin-only.';
COMMENT ON TABLE md_tracker_weeks IS
  'MD Daily Tracker — one row per ISO week (Mon–Sat), created lazily on first visit. RLS: admin-only.';
COMMENT ON TABLE md_tracker_entries IS
  'MD Daily Tracker — one daily log per (week, engine, day). RLS: admin-only; per-engine write enforced in server actions via md_tracker.<engine>.write.';
COMMENT ON TABLE md_tracker_week_reviews IS
  'MD Daily Tracker — end-of-week review per (week, engine): wins, carried over, CEO comment. RLS: admin-only; ceo_comment write enforced via md_tracker.review.';

NOTIFY pgrst, 'reload schema';
