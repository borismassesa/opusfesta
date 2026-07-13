-- OpusPass: atomic credit ledger for WhatsApp sends (invites + entrance passes).
--
-- Both send types draw on the SAME purchased guest count but from two
-- independent pools: buying N guests grants N invite credits AND N entrance-
-- pass credits. Usage was previously derived by counting distinct guests in
-- `whatsapp_messages` at request time in application code — correct, but not
-- atomic: two concurrent sends (a second browser tab, or a bulk send racing a
-- per-row send) could both read "1 remaining" and both consume it, going one
-- over quota. `credit_consumptions` becomes the source of truth for "has this
-- guest already consumed a credit of this kind for this event," checked and
-- written atomically by `consume_send_credit` below.
--
-- `event_id` is nullable to carry forward the same legacy-row semantics
-- `whatsapp_messages.event_id` already has: sends logged before event-scoping
-- shipped can't be attributed to one event, and treating them as "never
-- consumed" would double-charge a guest who was genuinely already sent to.
-- Going forward every new row always carries a concrete event_id.

CREATE TABLE IF NOT EXISTS public.credit_consumptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id         UUID REFERENCES public.wedding_events(id) ON DELETE SET NULL,
  guest_contact_id UUID NOT NULL REFERENCES public.guest_contacts(id) ON DELETE CASCADE,
  kind             TEXT NOT NULL,               -- 'invite' | 'entrance_pass'
  consumed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id, guest_contact_id, kind)
);

CREATE INDEX IF NOT EXISTS credit_consumptions_lookup_idx
  ON public.credit_consumptions (user_id, kind, guest_contact_id);

COMMENT ON TABLE public.credit_consumptions IS
  'One row per (guest, kind) the first time they are successfully sent to for an event — the quota source of truth. Re-sends never insert a second row. Written only via consume_send_credit().';
COMMENT ON COLUMN public.credit_consumptions.event_id IS
  'NULL only on backfilled rows that predate event-scoping; every row written going forward has a concrete event.';

-- Owner-scoped reads only; all writes go through the RPC below (service-role
-- callers only — the dashboard has no client-side Supabase access).
ALTER TABLE public.credit_consumptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credit_consumptions_select_own ON public.credit_consumptions;
CREATE POLICY credit_consumptions_select_own ON public.credit_consumptions
  FOR SELECT USING (requesting_user_id() = user_id);

-- ── Atomic check-and-consume ────────────────────────────────────────────────
--
-- Returns 'resend' (guest already holds a credit of this kind — matching this
-- event or a legacy NULL-event row — free to send again), 'consumed' (a fresh
-- credit was just spent), or 'blocked' (quota exhausted, caller must not send).
--
-- The advisory lock serializes concurrent calls for the same (user_id, kind)
-- pair so the "count then insert" below can't race across two simultaneous
-- sends — Postgres advisory xact locks auto-release at transaction end.
CREATE OR REPLACE FUNCTION public.consume_send_credit(
  p_user_id UUID,
  p_event_id UUID,
  p_guest_contact_id UUID,
  p_kind TEXT,
  p_purchased INTEGER
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already BOOLEAN;
  v_used INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_kind, 0));

  SELECT EXISTS (
    SELECT 1 FROM public.credit_consumptions
    WHERE user_id = p_user_id
      AND guest_contact_id = p_guest_contact_id
      AND kind = p_kind
      AND (event_id = p_event_id OR event_id IS NULL)
  ) INTO v_already;

  IF v_already THEN
    RETURN 'resend';
  END IF;

  SELECT count(*) INTO v_used
  FROM public.credit_consumptions
  WHERE user_id = p_user_id
    AND kind = p_kind
    AND (event_id = p_event_id OR event_id IS NULL);

  IF v_used >= p_purchased THEN
    RETURN 'blocked';
  END IF;

  INSERT INTO public.credit_consumptions (user_id, event_id, guest_contact_id, kind)
  VALUES (p_user_id, p_event_id, p_guest_contact_id, p_kind)
  ON CONFLICT (user_id, event_id, guest_contact_id, kind) DO NOTHING;

  RETURN 'consumed';
END;
$$;

-- ── Release a reservation the provider send then failed on ─────────────────
--
-- consume_send_credit() reserves atomically BEFORE the WhatsApp send happens
-- (so two concurrent sends can't both slip past the same last credit); the
-- caller only reaches here when that reservation returned 'consumed' (a fresh
-- spend) and the actual send then failed, so the credit must be handed back.
-- Never called for a 'resend' verdict — undoing a guest's original, long-ago
-- consumption would incorrectly forget they already hold a credit.
CREATE OR REPLACE FUNCTION public.release_send_credit(
  p_user_id UUID,
  p_event_id UUID,
  p_guest_contact_id UUID,
  p_kind TEXT
) RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.credit_consumptions
  WHERE user_id = p_user_id
    AND event_id = p_event_id
    AND guest_contact_id = p_guest_contact_id
    AND kind = p_kind;
$$;

-- ── One-time backfill from the existing whatsapp_messages log ──────────────
-- One row per (user, event, guest, kind) actually-successful, non-stub send —
-- earliest first, matching "first send consumes the credit."
INSERT INTO public.credit_consumptions (user_id, event_id, guest_contact_id, kind, consumed_at)
SELECT DISTINCT ON (user_id, event_id, guest_contact_id, kind)
  user_id, event_id, guest_contact_id, kind, created_at
FROM public.whatsapp_messages
WHERE direction = 'out'
  AND kind IN ('invite', 'entrance_pass')
  AND status IN ('sent', 'delivered', 'read')
  AND wamid NOT LIKE 'wamid.STUB-%'
  AND guest_contact_id IS NOT NULL
  AND user_id IS NOT NULL
ORDER BY user_id, event_id, guest_contact_id, kind, created_at ASC
ON CONFLICT (user_id, event_id, guest_contact_id, kind) DO NOTHING;
