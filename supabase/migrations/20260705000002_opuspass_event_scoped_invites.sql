-- OpusPass: scope invitation designs, quota, and send history to a specific
-- event instead of blending them across a couple's whole account.
--
-- Today `invitation_orders` (which design/quota a couple paid for) and
-- `whatsapp_messages`/`guest_message_log` (send history) have no idea which
-- event they belong to. A couple with two events and two different card
-- designs has no way to control which design goes to which event's guests —
-- the code just picks whichever order was paid most recently for EVERY send.
--
-- These three columns are additive and nullable. For a couple with exactly
-- ONE event, there's no ambiguity — backfill their existing rows to that
-- event so nothing visibly changes for the common case. For a couple with
-- 2+ events, we cannot know from data alone which existing order/send
-- belonged to which event, so those rows are left NULL ("unassigned") for
-- the couple to resolve via the app rather than guessed here.

ALTER TABLE public.invitation_orders
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.wedding_events(id) ON DELETE SET NULL;

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.wedding_events(id) ON DELETE SET NULL;

ALTER TABLE public.guest_message_log
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.wedding_events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS invitation_orders_event_id_idx ON public.invitation_orders(event_id);
CREATE INDEX IF NOT EXISTS whatsapp_messages_event_id_idx ON public.whatsapp_messages(event_id);
CREATE INDEX IF NOT EXISTS guest_message_log_event_id_idx ON public.guest_message_log(event_id);

COMMENT ON COLUMN public.invitation_orders.event_id IS
  'Which of the buyer''s wedding_events this design/quota is for. NULL = unassigned (predates event-scoping, or couple has multiple events and has not yet assigned it).';
COMMENT ON COLUMN public.whatsapp_messages.event_id IS
  'Which event this send/receipt was for. NULL on rows that predate event-scoping.';
COMMENT ON COLUMN public.guest_message_log.event_id IS
  'Which event this logged send was for. NULL on rows that predate event-scoping.';

-- ── Safe backfill: only for couples with exactly one event ─────────────────
-- Ambiguous couples (2+ events) are left NULL on purpose (see header).

-- min()/max() have no aggregate for uuid; array_agg picks a single value
-- deterministically enough here since each group has exactly one row.
WITH single_event_users AS (
  SELECT user_id, (array_agg(id))[1] AS only_event_id
  FROM public.wedding_events
  GROUP BY user_id
  HAVING count(*) = 1
)
UPDATE public.invitation_orders o
SET event_id = s.only_event_id
FROM single_event_users s
WHERE o.event_id IS NULL
  AND o.user_id = s.user_id;

WITH single_event_users AS (
  SELECT user_id, (array_agg(id))[1] AS only_event_id
  FROM public.wedding_events
  GROUP BY user_id
  HAVING count(*) = 1
)
UPDATE public.whatsapp_messages m
SET event_id = s.only_event_id
FROM single_event_users s
WHERE m.event_id IS NULL
  AND m.user_id = s.user_id;

WITH single_event_users AS (
  SELECT user_id, (array_agg(id))[1] AS only_event_id
  FROM public.wedding_events
  GROUP BY user_id
  HAVING count(*) = 1
)
UPDATE public.guest_message_log g
SET event_id = s.only_event_id
FROM single_event_users s
WHERE g.event_id IS NULL
  AND g.user_id = s.user_id;
