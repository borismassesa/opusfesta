-- OpusPass: per-event card selection for the Thank You WhatsApp broadcast.
--
-- Mirrors couple_profiles.pledge_page.eventCovers — a couple can pick a card
-- design from the invitation catalog (or clear it back to the generic
-- banner) as the header image on the thank-you message, scoped per event the
-- same way the pledge page cover is. Kept as its own column rather than
-- reusing pledge_page since these are two distinct sends with independent
-- card choices.

ALTER TABLE public.couple_profiles
  ADD COLUMN IF NOT EXISTS thank_you_config JSONB;

COMMENT ON COLUMN public.couple_profiles.thank_you_config IS
  'Per-event Thank You WhatsApp header card: { eventCovers: { [eventId]: { coverImageUrl, coverIsFullTemplate } } }. NULL/missing entry = generic banner.';
