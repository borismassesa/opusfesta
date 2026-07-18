-- Same bug class as 20260718000001 (gift registry) and 20260718000002
-- (guestbook): the public invite hub's link and RSVP still live on
-- couple_profiles.public_slug/public_sharing_enabled — account-wide, not
-- per event. Worse than the other two here: submitPublicInviteRsvp fans one
-- guest's RSVP out to EVERY public+allow_rsvp event under the couple, so a
-- guest invited to just one of a couple's multiple events (e.g. a private
-- kitchen party vs. the main wedding) ends up marked attending all of them.
-- Moves the invite hub's own slug + sharing toggle onto wedding_events, one
-- link per event, matching the gift-registry/guestbook pattern.

ALTER TABLE wedding_events
  ADD COLUMN IF NOT EXISTS invite_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS invite_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_wedding_events_invite_slug
  ON public.wedding_events(invite_slug);

-- Backfill: a couple who already shared their (pre-event-scoping) invite
-- link keeps that exact slug working, now living on their first event — old
-- /i/<slug> links redirect to /rsvp/event/<slug>, which resolves the same
-- value against this column.
WITH ranked_events AS (
  SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY sort_order, created_at) AS rn
  FROM wedding_events
)
UPDATE wedding_events e
SET
  invite_slug = cp.public_slug,
  invite_sharing_enabled = COALESCE(cp.public_sharing_enabled, FALSE)
FROM couple_profiles cp, ranked_events re
WHERE cp.user_id = e.user_id
  AND re.id = e.id
  AND re.rn = 1
  AND cp.public_slug IS NOT NULL;

NOTIFY pgrst, 'reload schema';
