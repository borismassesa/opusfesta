-- OpusPass: admin-managed credit adjustments, on top of purchased quota.
--
-- `purchased` (invite/entrance-pass pool size) is derived from paid
-- invitation_orders and never edited directly — that would erase the record
-- of what a couple actually bought. This table is the audit-trailed layer on
-- top: finance can grant comps/corrections or revoke abuse, each with a
-- required reason and the acting admin's identity, without touching the
-- purchase record. Effective purchased, per (user, event, kind) =
-- sum(invitation_orders.items[].guests) + sum(entitlement_adjustments.delta).

CREATE TABLE IF NOT EXISTS public.entitlement_adjustments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id    UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('invite', 'entrance_pass')),
  delta       INTEGER NOT NULL CHECK (delta <> 0),
  reason      TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  -- Admin identity as email, matching invitation_orders.reviewed_by — admin
  -- auth here is Clerk + admin_whitelist, not a public.users row to FK to.
  admin_email TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entitlement_adjustments_lookup_idx
  ON public.entitlement_adjustments (user_id, event_id, kind);

COMMENT ON TABLE public.entitlement_adjustments IS
  'Admin-granted or -revoked credits on top of purchased quota, one row per adjustment (never edited/deleted — reverse with an opposite-sign row so the audit trail stays intact).';

-- Owner-scoped reads (so the couple's own quota math can include adjustments);
-- writes happen via the service-role admin client only.
ALTER TABLE public.entitlement_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS entitlement_adjustments_select_own ON public.entitlement_adjustments;
CREATE POLICY entitlement_adjustments_select_own ON public.entitlement_adjustments
  FOR SELECT USING (requesting_user_id() = user_id);
