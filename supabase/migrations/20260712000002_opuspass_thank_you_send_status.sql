-- OpusPass: track whether a thank-you message has been sent to a guest for a
-- given event.
--
-- Unlike the pledge-ask tracker (guest_contacts.pledge_invite_sent_at, which
-- is couple-level — pledges aren't tied to one event), "thanked for
-- attending" is inherently per-event, so this tracker lives on
-- guest_invitations (which already carries event_id and rsvp_status) rather
-- than on guest_contacts.

ALTER TABLE public.guest_invitations
  ADD COLUMN IF NOT EXISTS thank_you_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS thank_you_count INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.guest_invitations.thank_you_sent_at IS
  'Last time this guest was sent a thank-you message for this event (any channel). NULL = never sent.';
COMMENT ON COLUMN public.guest_invitations.thank_you_count IS
  'How many times this guest has been sent a thank-you message for this event.';
