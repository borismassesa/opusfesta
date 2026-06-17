-- OpusPass seat collection — per-event seating planner
--
-- A couple lays out tables for an event and drags attending guests onto them.
-- Two tables, both owner-scoped via user_id (-> users.id) so RLS stays the same
-- simple `requesting_user_id() = user_id` check used across the dashboard. All
-- reads/writes go through the service-role client in trusted server actions.
--
--   seating_tables       one row per table on the floor plan for an event.
--   seating_assignments  one row per guest party seated at a table. A guest can
--                        be seated at most once per event (UNIQUE), and the seats
--                        they occupy are derived live from their attending
--                        guest_invitations.party_size — NOT denormalized here, so
--                        a headcount change is reflected immediately.

-- 1) Tables on the floor plan
CREATE TABLE IF NOT EXISTS seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,

  name TEXT NOT NULL DEFAULT 'Table',
  capacity INT NOT NULL DEFAULT 10 CHECK (capacity >= 0),
  -- the "Top table" — rendered first with a star, for the couple/head party.
  is_head BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Guest party -> table assignments
CREATE TABLE IF NOT EXISTS seating_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
  guest_contact_id UUID NOT NULL REFERENCES guest_contacts(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- one seat assignment per guest per event (re-seating updates table_id)
  UNIQUE (guest_contact_id, event_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seating_tables_user_id ON seating_tables(user_id);
CREATE INDEX IF NOT EXISTS idx_seating_tables_event ON seating_tables(event_id);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_user_id ON seating_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_event ON seating_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_table ON seating_assignments(table_id);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_guest ON seating_assignments(guest_contact_id);

-- updated_at triggers (reuse the shared trigger fn from the dashboard migration)
DROP TRIGGER IF EXISTS trg_seating_tables_updated_at ON seating_tables;
CREATE TRIGGER trg_seating_tables_updated_at
  BEFORE UPDATE ON seating_tables FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_seating_assignments_updated_at ON seating_assignments;
CREATE TRIGGER trg_seating_assignments_updated_at
  BEFORE UPDATE ON seating_assignments FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- RLS: owner-only. Reads/writes happen server-side via the service-role client.
ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY seating_tables_owner ON seating_tables
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY seating_assignments_owner ON seating_assignments
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);
