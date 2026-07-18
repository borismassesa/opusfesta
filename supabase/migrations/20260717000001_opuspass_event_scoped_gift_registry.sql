-- OpusPass: scope the gift registry to a specific wedding event, mirroring
-- 20260708000001_opuspass_event_scoped_pledges.sql for event_pledges.
--
-- gift_registry_items was created couple-scoped (one registry regardless of
-- how many events a couple runs). Multi-event couples want to organize gifts
-- per occasion (e.g. a honeymoon fund tagged to the main wedding vs. small
-- gifts for a send-off), matching how Pledges/Guests/RSVPs already work.
--
-- Additive and nullable at the schema level; the app always sets it for new
-- gifts. Existing rows are backfilled to the couple's FIRST event (same
-- ordering used everywhere else for the default event).

ALTER TABLE public.gift_registry_items
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.wedding_events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS gift_registry_items_event_id_idx ON public.gift_registry_items(event_id);

COMMENT ON COLUMN public.gift_registry_items.event_id IS
  'Which of the couple''s wedding_events this gift is for. NULL only when the couple had no events when the gift was added; the app shows such rows under the default (first) event.';

-- ── Backfill: every existing gift goes to the couple's first event ─────────
WITH first_events AS (
  SELECT DISTINCT ON (user_id) user_id, id AS first_event_id
  FROM public.wedding_events
  ORDER BY user_id, sort_order ASC, starts_at ASC NULLS LAST, created_at ASC
)
UPDATE public.gift_registry_items g
SET event_id = f.first_event_id
FROM first_events f
WHERE g.event_id IS NULL
  AND g.user_id = f.user_id;

NOTIFY pgrst, 'reload schema';
