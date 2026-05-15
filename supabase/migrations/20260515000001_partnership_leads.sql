-- Partnership leads — Marketing & Partnership department's inbox.
--
-- Tracks incoming partnership opportunities: brand sponsorships,
-- agency collaborations, vendor co-marketing, influencer outreach. The
-- Marketing dashboard lane reads "leads without follow-up in N days"
-- off this table; the /operations/partnerships page is a basic list
-- view (Phase 2 — full CRUD lands later).
--
-- Access model: admin-only via RLS. The admin app reads/writes through
-- the service role key (bypasses RLS); these policies are belt-and-
-- braces for direct user-JWT access.

CREATE TABLE IF NOT EXISTS partnership_leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  company_name text,
  -- Lead category — keeps the funnel digestible without a free-text
  -- field everyone abuses. Add values via migration when the team
  -- coins new ones.
  lead_type text NOT NULL DEFAULT 'Other'
    CHECK (lead_type IN ('Brand', 'Agency', 'Vendor', 'Influencer', 'Other')),
  -- Funnel stage. "New" is the inbox state; everything else is a
  -- decision someone made.
  status text NOT NULL DEFAULT 'New'
    CHECK (status IN ('New', 'Contacted', 'Negotiating', 'Closed Won', 'Closed Lost')),
  source text NOT NULL DEFAULT 'Direct'
    CHECK (source IN ('Web form', 'Email', 'Referral', 'Outreach', 'Event', 'Direct')),
  notes text,
  -- Person on the team currently driving this lead. Soft-FK to
  -- workforce_employees so a deletion doesn't orphan the row — we
  -- just lose the assignment.
  assigned_to uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  -- Last time anyone touched this lead. Drives the "no follow-up in
  -- 5 days" lane card.
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  -- Optional: when the owner promised to follow up next. Sortable for
  -- "what's due today" views.
  follow_up_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partnership_leads_status
  ON partnership_leads (status);
CREATE INDEX IF NOT EXISTS idx_partnership_leads_last_activity
  ON partnership_leads (last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_partnership_leads_assigned
  ON partnership_leads (assigned_to);

-- updated_at trigger — re-use the shared helper introduced in 20260512.
DROP TRIGGER IF EXISTS trg_partnership_leads_updated_at ON partnership_leads;
CREATE TRIGGER trg_partnership_leads_updated_at
  BEFORE UPDATE ON partnership_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS — readers see, admins mutate.
ALTER TABLE partnership_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partnership_leads_read" ON partnership_leads;
CREATE POLICY "partnership_leads_read" ON partnership_leads
  FOR SELECT TO authenticated
  USING (is_workforce_reader());

DROP POLICY IF EXISTS "partnership_leads_write" ON partnership_leads;
CREATE POLICY "partnership_leads_write" ON partnership_leads
  FOR ALL TO authenticated
  USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());

COMMENT ON TABLE partnership_leads
  IS 'Marketing module — partnership pipeline. RLS: admin-only.';

NOTIFY pgrst, 'reload schema';
