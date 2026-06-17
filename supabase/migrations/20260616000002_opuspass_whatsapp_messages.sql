-- OpusPass WhatsApp Business messaging log.
--
-- Tracks business-initiated invitation sends (outbound) and inbound quick-reply
-- button taps (RSVP yes/no, view-location) from the Meta Cloud API webhook.
-- The unique `wamid` (WhatsApp message id) gives idempotency: Meta retries
-- webhook deliveries, so we de-dupe inbound events on it.

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES public.users(id) ON DELETE CASCADE,
  guest_contact_id UUID REFERENCES public.guest_contacts(id) ON DELETE SET NULL,
  direction        TEXT NOT NULL,                 -- 'out' | 'in'
  wamid            TEXT UNIQUE,                    -- WhatsApp message id (idempotency)
  kind             TEXT,                           -- 'invite' | 'rsvp_yes' | 'rsvp_no' | 'view_location' | 'text'
  status           TEXT NOT NULL DEFAULT 'sent',   -- out: sent|failed | in: received|processed
  error            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user    ON public.whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_guest   ON public.whatsapp_messages(guest_contact_id);

-- Owner-scoped reads (dashboard delivery status). Writes happen via the
-- service-role client in server actions / the webhook, so no insert policy.
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS whatsapp_messages_select_own ON public.whatsapp_messages;
CREATE POLICY whatsapp_messages_select_own ON public.whatsapp_messages
  FOR SELECT USING (requesting_user_id() = user_id);
