-- OpusPass: scope pledges ("michango") to a specific wedding event.
--
-- `event_pledges` was created before couples could manage multiple events, so
-- every pledge belongs to the couple as a whole. A couple running a send-off
-- AND a wedding has one blended pledge book: totals, follow-ups, and reports
-- all mix the two occasions. The dashboard now asks the couple which event
-- they are working on, so each pledge needs to know its event.
--
-- The column is additive and nullable at the schema level (the app always
-- sets it for new pledges). Existing pledges are backfilled to the couple's
-- FIRST event (same ordering the dashboard uses everywhere for the default
-- event: sort_order, then start date). Couples with no events yet keep NULL;
-- the app treats NULL as belonging to the default event once one exists.

ALTER TABLE public.event_pledges
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.wedding_events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS event_pledges_event_id_idx ON public.event_pledges(event_id);

COMMENT ON COLUMN public.event_pledges.event_id IS
  'Which of the couple''s wedding_events this pledge is for. NULL only when the couple had no events when the pledge was recorded; the app shows such rows under the default (first) event.';

-- ── Backfill: every existing pledge goes to the couple's first event ───────
-- "First" = the same default-event ordering used across the dashboard
-- (sort_order ASC, starts_at ASC NULLS LAST, created_at ASC as tiebreak).
WITH first_events AS (
  SELECT DISTINCT ON (user_id) user_id, id AS first_event_id
  FROM public.wedding_events
  ORDER BY user_id, sort_order ASC, starts_at ASC NULLS LAST, created_at ASC
)
UPDATE public.event_pledges p
SET event_id = f.first_event_id
FROM first_events f
WHERE p.event_id IS NULL
  AND p.user_id = f.user_id;
