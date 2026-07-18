-- The gift registry's hero (name/header, banner, cover photo, welcome
-- message) and its public share link used to live on couple_profiles — one
-- value for the whole account, even though gift_registry_items are already
-- scoped to a single wedding_events row. A couple managing more than one
-- event (e.g. a send-off and a wedding) saw the same registry name and the
-- same public link for both. These columns move that customization onto
-- wedding_events so each event gets its own name, its own hero, and its own
-- shareable /gift-registry/<slug> link.

ALTER TABLE wedding_events
  ADD COLUMN IF NOT EXISTS gift_registry_header TEXT,
  ADD COLUMN IF NOT EXISTS gift_registry_banner_image_url TEXT,
  ADD COLUMN IF NOT EXISTS gift_registry_cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS gift_registry_welcome_message TEXT,
  ADD COLUMN IF NOT EXISTS gift_registry_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS gift_registry_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_wedding_events_gift_registry_slug
  ON public.wedding_events(gift_registry_slug);

-- Backfill: a couple who already customized their (single, pre-event-scoping)
-- registry keeps that customization and public link on their one existing
-- event row, instead of losing it silently.
WITH ranked_events AS (
  SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY sort_order, created_at) AS rn
  FROM wedding_events
)
UPDATE wedding_events e
SET
  gift_registry_header = cp.registry_header,
  gift_registry_banner_image_url = cp.registry_banner_image_url,
  gift_registry_cover_image_url = cp.registry_cover_image_url,
  gift_registry_welcome_message = cp.registry_welcome_message,
  gift_registry_slug = cp.public_slug,
  gift_registry_sharing_enabled = COALESCE(cp.public_sharing_enabled, FALSE)
FROM couple_profiles cp, ranked_events re
WHERE cp.user_id = e.user_id
  AND re.id = e.id
  AND re.rn = 1
  AND cp.public_slug IS NOT NULL;

NOTIFY pgrst, 'reload schema';
