-- OpusPass: scope the guestbook to a specific wedding event, mirroring
-- 20260717000001_opuspass_event_scoped_gift_registry.sql for
-- gift_registry_items (itself mirroring the original event_pledges scoping).
--
-- guestbook_entries was created couple-scoped. Multi-event couples want to
-- see who left a message for which occasion, matching how Pledges/Guests/
-- RSVPs/Seating/Gift Registry already work.
--
-- Additive and nullable at the schema level; the app always sets it for new
-- entries (defaulting to the couple's first event when a specific one isn't
-- given — see resolveEventIdOrDefault). Existing rows are backfilled to the
-- couple's FIRST event (same ordering used everywhere else for the default
-- event).

ALTER TABLE public.guestbook_entries
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.wedding_events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS guestbook_entries_event_id_idx ON public.guestbook_entries(event_id);

COMMENT ON COLUMN public.guestbook_entries.event_id IS
  'Which of the couple''s wedding_events this message is for. NULL only when the couple had no events when the message was recorded; the app shows such rows under the default (first) event.';

-- ── Backfill: every existing message goes to the couple's first event ─────
WITH first_events AS (
  SELECT DISTINCT ON (user_id) user_id, id AS first_event_id
  FROM public.wedding_events
  ORDER BY user_id, sort_order ASC, starts_at ASC NULLS LAST, created_at ASC
)
UPDATE public.guestbook_entries g
SET event_id = f.first_event_id
FROM first_events f
WHERE g.event_id IS NULL
  AND g.user_id = f.user_id;

NOTIFY pgrst, 'reload schema';
