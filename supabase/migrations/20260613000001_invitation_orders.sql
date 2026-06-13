-- Real invitation-order payments for OpusPass.
--
-- Before this, checkout was a pure front-end simulation: clicking "Pay" stamped
-- the order "Paid" in localStorage and rendered a paid invoice WITHOUT any money
-- moving or any server record. This adds an authoritative order ledger so a
-- payment is only ever "paid" once the provider (Selcom) confirms it via webhook.
--
-- Lifecycle: an order is born `pending`, a push/redirect requests the money, and
-- ONLY a verified provider callback transitions it to `paid` (or `failed`).

-- ── Status enum ──────────────────────────────────────────────────────────────
-- pending    — order created, payment requested (USSD push sent / card redirect)
-- processing — provider acknowledged, awaiting the customer's PIN/3-D Secure
-- paid       — provider confirmed funds received (terminal, success)
-- failed     — provider reported failure / customer cancelled / wrong PIN
-- expired    — no resolution within the push window (terminal)
-- refunded   — paid then reversed (manual ops; terminal)
DO $$ BEGIN
  CREATE TYPE invitation_order_status AS ENUM
    ('pending', 'processing', 'paid', 'failed', 'expired', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Orders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitation_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Human-facing reference shown on the invoice (e.g. OF-2026-AB12CD). Unique.
  ref             text NOT NULL UNIQUE,
  -- Nullable: guest checkout is allowed (no sign-in required to buy).
  user_id         uuid,

  status          invitation_order_status NOT NULL DEFAULT 'pending',

  -- Money. Authoritative amounts are recomputed server-side at initiate time,
  -- never trusted from the client. Stored in major units (TZS shillings).
  currency        text NOT NULL DEFAULT 'TZS',
  subtotal        numeric(12, 2) NOT NULL,
  discount        numeric(12, 2) NOT NULL DEFAULT 0,
  amount_total    numeric(12, 2) NOT NULL,

  -- Buyer snapshot (so the invoice renders without joining anything).
  contact_name    text,
  contact_email   text NOT NULL,
  contact_phone   text NOT NULL,
  event_date      date,

  -- Immutable snapshot of the cart lines at purchase time.
  items           jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Provider details.
  provider          text NOT NULL DEFAULT 'selcom',
  payment_method    text,            -- 'mobile' | 'card'
  payer_phone       text,            -- msisdn that received the push
  provider_order_id text,            -- Selcom transid / our id echoed back
  payment_label     text,            -- e.g. "M-Pesa +255…" for the invoice

  created_at      timestamptz NOT NULL DEFAULT now(),
  paid_at         timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitation_orders_status     ON invitation_orders (status);
CREATE INDEX IF NOT EXISTS idx_invitation_orders_user       ON invitation_orders (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invitation_orders_created    ON invitation_orders (created_at DESC);

-- ── Payment events (audit log + webhook idempotency) ─────────────────────────
-- Every provider callback is appended here. `provider_event_id` is UNIQUE so a
-- replayed/duplicated webhook is a no-op (insert is rejected, order untouched).
CREATE TABLE IF NOT EXISTS invitation_payment_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES invitation_orders (id) ON DELETE CASCADE,
  provider_event_id text UNIQUE,
  status            invitation_order_status,
  raw_payload       jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitation_payment_events_order ON invitation_payment_events (order_id);

-- ── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_invitation_orders_updated_at()
RETURNS trigger LANGUAGE plpgsql
-- Pin search_path (empty) so the function isn't resolution-hijackable — matches
-- the project's other SECURITY-conscious functions and keeps the linter happy.
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_invitation_orders_updated_at ON invitation_orders;
CREATE TRIGGER trg_invitation_orders_updated_at
  BEFORE UPDATE ON invitation_orders
  FOR EACH ROW EXECUTE FUNCTION set_invitation_orders_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Lock both tables down completely. All access is server-side through the
-- service-role key (which bypasses RLS); the anon/auth roles get nothing. This
-- prevents a malicious client from reading other buyers' contacts or — far
-- worse — flipping their own order to `paid`.
ALTER TABLE invitation_orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_payment_events  ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: deny-all for non-service roles.

COMMENT ON TABLE invitation_orders IS
  'OpusPass invitation purchases. Status is authoritative; only the Selcom webhook flips pending→paid.';
COMMENT ON TABLE invitation_payment_events IS
  'Append-only log of Selcom payment callbacks. provider_event_id UNIQUE gives webhook idempotency.';
