-- OpusPass pledges ("michango") — community contributions toward an event.
--
-- In Tanzania a wedding/event is funded by pledges that come BEFORE guest-list
-- logistics: the couple/committee asks a person what they can contribute, the
-- person commits an amount (and roughly when), reminders chase the payment, the
-- money is recorded, then attendance is confirmed and a card prepared. A pledge
-- is therefore the lead entity; the guest_contacts / guest_invitations roster we
-- already have is the downstream stage a contributor flows into.
--
-- Every pledge ties to a guest_contacts row (one roster). New self-pledgers from
-- the public /pledge/<token> page become guest_contacts, exactly like the
-- Contact Collector flow. Ownership is denormalized via user_id so RLS stays a
-- simple `requesting_user_id() = user_id` check; public pledge writes go through
-- a trusted server action with the service-role client (no RLS grant).

CREATE TABLE IF NOT EXISTS event_pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_contact_id UUID NOT NULL REFERENCES guest_contacts(id) ON DELETE CASCADE,

  -- money (TZS by default). amount_received tracks what's actually come in.
  pledged_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_received NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TZS',
  promised_date DATE,                       -- when they said they'd pay by

  -- lifecycle: invited -> pledged -> partial -> paid (or declined)
  status TEXT NOT NULL DEFAULT 'invited',   -- invited | pledged | partial | paid | declined
  payment_method TEXT,                      -- mpesa | tigopesa | airtel | halopesa | cash | bank | other

  -- asked once they've paid, so the couple can prepare a card
  will_attend TEXT,                         -- null | yes | no | maybe
  card_status TEXT NOT NULL DEFAULT 'none', -- none | preparing | prepared | sent

  -- follow-up scheduling (manual one-tap now; cron-driven once a provider is wired)
  reminder_cadence TEXT NOT NULL DEFAULT 'none', -- none | weekly | biweekly
  next_reminder_at TIMESTAMPTZ,
  last_reminded_at TIMESTAMPTZ,
  reminder_count INT NOT NULL DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lightweight log of pledge follow-ups (mirrors guest_message_log)
CREATE TABLE IF NOT EXISTS pledge_reminder_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pledge_id UUID NOT NULL REFERENCES event_pledges(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'link', -- whatsapp | sms | email | link | auto
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_pledges_user_id ON event_pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_event_pledges_guest ON event_pledges(guest_contact_id);
CREATE INDEX IF NOT EXISTS idx_event_pledges_status ON event_pledges(status);
CREATE INDEX IF NOT EXISTS idx_event_pledges_next_reminder ON event_pledges(next_reminder_at);
CREATE INDEX IF NOT EXISTS idx_pledge_reminder_log_user_id ON pledge_reminder_log(user_id);
CREATE INDEX IF NOT EXISTS idx_pledge_reminder_log_pledge ON pledge_reminder_log(pledge_id);

-- updated_at trigger (reuse the shared trigger fn defined with the dashboard tables)
DROP TRIGGER IF EXISTS trg_event_pledges_updated_at ON event_pledges;
CREATE TRIGGER trg_event_pledges_updated_at
  BEFORE UPDATE ON event_pledges FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- RLS: owner-only. Public pledge submission is handled server-side via service role.
ALTER TABLE event_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledge_reminder_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_pledges_owner ON event_pledges
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY pledge_reminder_log_owner ON pledge_reminder_log
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);
