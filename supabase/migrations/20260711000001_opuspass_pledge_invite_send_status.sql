-- OpusPass: track whether a pledge-ask link has been sent to a guest contact.
--
-- The "Send to your guests" table on the Pledges page (Share & preview tab)
-- needs a real Not-sent / Awaiting status per contact, same idea as the
-- wedding-invitation send tracker (guest_contacts.last_invited_at /
-- invite_count) — but pledges are a separate ask from the wedding invite
-- itself, so they get their own dedicated columns rather than reusing those.
--
-- Pledge sends are couple-level (not tied to one event — see
-- resolvePledgeSendContext in actions.ts), so no event_id here either.

ALTER TABLE public.guest_contacts
  ADD COLUMN IF NOT EXISTS pledge_invite_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pledge_invite_count INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.guest_contacts.pledge_invite_sent_at IS
  'Last time this contact was sent a pledge-page link (any channel). NULL = never sent.';
COMMENT ON COLUMN public.guest_contacts.pledge_invite_count IS
  'How many times this contact has been sent a pledge-page link.';
