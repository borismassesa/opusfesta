-- OpusPass Send Invites: couple-confirmed WhatsApp template variables.
--
-- The invite template's {{2}} (host/couple name) and {{3}} (event category)
-- were derived silently from the profile + event type. Couples must now
-- confirm or override them before their first send, so the two values get
-- persistent, couple-editable homes on couple_profiles. NULL means "not yet
-- confirmed" and the dashboard blocks sends until both are saved.

ALTER TABLE public.couple_profiles
  ADD COLUMN IF NOT EXISTS invite_host_name TEXT,
  ADD COLUMN IF NOT EXISTS invite_event_category TEXT;

COMMENT ON COLUMN public.couple_profiles.invite_host_name IS
  'WhatsApp invite template {{2}}: who the invitation is from (e.g. "Asha & Juma"). NULL until the couple confirms it on Send Invites.';
COMMENT ON COLUMN public.couple_profiles.invite_event_category IS
  'WhatsApp invite template {{3}}: Swahili event noun (e.g. "harusi"). NULL until the couple confirms it on Send Invites.';
