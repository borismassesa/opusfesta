-- Same bug class as 20260718000001 (gift registry): guestbook_entries are
-- already scoped by event_id and the dashboard's moderation queue already
-- has a per-event picker, but the public /guestbook/<slug> link still lived
-- on couple_profiles.public_slug — shared account-wide with the invite hub
-- — so the link shown never matched whichever event was selected, and the
-- public page mixed messages from every event together. Moves the
-- guestbook's own slug + sharing toggle onto wedding_events.

ALTER TABLE wedding_events
  ADD COLUMN IF NOT EXISTS guestbook_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS guestbook_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_wedding_events_guestbook_slug
  ON public.wedding_events(guestbook_slug);

-- Backfill: a couple who already shared their (pre-event-scoping) guestbook
-- link keeps that exact link working, now living on their first event.
WITH ranked_events AS (
  SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY sort_order, created_at) AS rn
  FROM wedding_events
)
UPDATE wedding_events e
SET
  guestbook_slug = cp.public_slug,
  guestbook_sharing_enabled = COALESCE(cp.public_sharing_enabled, FALSE)
FROM couple_profiles cp, ranked_events re
WHERE cp.user_id = e.user_id
  AND re.id = e.id
  AND re.rn = 1
  AND cp.public_slug IS NOT NULL;

NOTIFY pgrst, 'reload schema';
