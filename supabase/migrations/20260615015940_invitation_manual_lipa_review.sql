-- Manual M-Pesa / Lipa Namba review support for OpusPass invitation orders.
-- Customers pay OpusFesta externally, then submit the payer account name,
-- payer phone, and payment reference. Finance reviews that row and marks the
-- order paid once the transaction is reconciled.

ALTER TABLE invitation_orders
  ADD COLUMN IF NOT EXISTS payer_name text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by text,
  ADD COLUMN IF NOT EXISTS review_note text,
  ADD COLUMN IF NOT EXISTS customer_invoice_emailed_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_notified_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_invitation_orders_payment_reference
  ON invitation_orders (payment_reference)
  WHERE payment_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invitation_orders_manual_review
  ON invitation_orders (status, payment_submitted_at DESC)
  WHERE provider = 'mpesa_lipa_namba';

COMMENT ON COLUMN invitation_orders.payer_name IS
  'Manual Lipa Namba payer account name supplied by the customer.';
COMMENT ON COLUMN invitation_orders.payment_reference IS
  'Manual Lipa Namba transaction / confirmation reference supplied by the customer.';
COMMENT ON COLUMN invitation_orders.payment_submitted_at IS
  'When the customer submitted the manual payment evidence for finance review.';
COMMENT ON COLUMN invitation_orders.reviewed_by IS
  'Admin email that approved or rejected a manual Lipa Namba payment.';
