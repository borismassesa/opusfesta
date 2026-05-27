-- OpusPass couple dashboard — invitation sending + RSVP tracking
--
-- Event-centric model so a couple can run multiple events (ceremony,
-- reception, ...), keep a single guest roster, and track per-event RSVPs.
-- Each guest gets a public_token that powers a shareable, no-login RSVP page.
--
-- Ownership is denormalized onto every table via user_id (-> users.id) so RLS
-- stays a simple `requesting_user_id() = user_id` check. Public RSVP reads and
-- writes are NOT granted via RLS — they go through trusted server actions that
-- validate the bearer token with the service-role client.

-- gen_random_bytes() (used for public_token below) lives in pgcrypto.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Events the couple is hosting
CREATE TABLE IF NOT EXISTS wedding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  couple_profile_id UUID REFERENCES couple_profiles(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'other', -- ceremony | reception | engagement | rehearsal | send_off | other
  description TEXT,

  venue_name TEXT,
  address TEXT,
  city TEXT,

  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  dress_code TEXT,

  -- whether this event collects meal choices on the RSVP page
  collect_meal_choice BOOLEAN NOT NULL DEFAULT false,
  meal_options TEXT[] NOT NULL DEFAULT '{}',

  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Guest roster (a person or household the couple may invite)
CREATE TABLE IF NOT EXISTS guest_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp_phone TEXT,

  group_tag TEXT,             -- e.g. "Bride's family", "University friends"
  max_party_size INT NOT NULL DEFAULT 1, -- how many seats this invite may bring
  notes TEXT,

  -- shareable, unguessable token for the public RSVP page
  public_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),

  last_invited_at TIMESTAMPTZ,
  invite_count INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Per-event RSVP: links a guest to an event with their response
CREATE TABLE IF NOT EXISTS guest_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_contact_id UUID NOT NULL REFERENCES guest_contacts(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,

  rsvp_status TEXT NOT NULL DEFAULT 'pending', -- pending | attending | declined | maybe
  party_size INT NOT NULL DEFAULT 1,           -- headcount the guest confirmed
  meal_choice TEXT,
  dietary_notes TEXT,
  guest_message TEXT,

  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (guest_contact_id, event_id)
);

-- 4) Lightweight log of invite sends/shares for tracking
CREATE TABLE IF NOT EXISTS guest_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_contact_id UUID NOT NULL REFERENCES guest_contacts(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'link', -- whatsapp | sms | email | link
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wedding_events_user_id ON wedding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_contacts_user_id ON guest_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_contacts_public_token ON guest_contacts(public_token);
CREATE INDEX IF NOT EXISTS idx_guest_invitations_user_id ON guest_invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_invitations_guest ON guest_invitations(guest_contact_id);
CREATE INDEX IF NOT EXISTS idx_guest_invitations_event ON guest_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_message_log_user_id ON guest_message_log(user_id);

-- updated_at triggers (reuse a shared trigger fn)
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wedding_events_updated_at ON wedding_events;
CREATE TRIGGER trg_wedding_events_updated_at
  BEFORE UPDATE ON wedding_events FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_guest_contacts_updated_at ON guest_contacts;
CREATE TRIGGER trg_guest_contacts_updated_at
  BEFORE UPDATE ON guest_contacts FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_guest_invitations_updated_at ON guest_invitations;
CREATE TRIGGER trg_guest_invitations_updated_at
  BEFORE UPDATE ON guest_invitations FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- RLS: owner-only. Public RSVP access is handled server-side via service role.
ALTER TABLE wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_message_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY wedding_events_owner ON wedding_events
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY guest_contacts_owner ON guest_contacts
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY guest_invitations_owner ON guest_invitations
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY guest_message_log_owner ON guest_message_log
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);
