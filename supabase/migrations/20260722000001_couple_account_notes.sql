-- OpusPass: internal staff notes on a couple's account.
--
-- Backs the Notes tab of admin's Couple Accounts console. Deliberately
-- staff-only: these are operational notes about a couple (payment chased,
-- called about a date change, flagged as a duplicate signup), never content
-- the couple should see. Append-only in practice — the UI only ever inserts,
-- so the trail of who said what and when stays intact.
--
-- Admin identity is stored as an email, matching entitlement_adjustments
-- (20260711000003) and invitation_orders.reviewed_by: admin auth is Clerk +
-- workforce_employees, so there is no public.users row to FK to.

CREATE TABLE IF NOT EXISTS public.couple_account_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL CHECK (length(trim(body)) > 0),
  admin_email TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS couple_account_notes_user_idx
  ON public.couple_account_notes (user_id, created_at DESC);

COMMENT ON TABLE public.couple_account_notes IS
  'Internal admin notes about a couple''s account. Staff-only: no RLS policy grants any couple access to their own rows, and all reads/writes go through the service-role client.';

-- RLS on with zero policies: nothing reachable from an anon or authenticated
-- JWT. Only the service-role client (which bypasses RLS) can touch this table.
ALTER TABLE public.couple_account_notes ENABLE ROW LEVEL SECURITY;
