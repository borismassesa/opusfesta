-- Vendor booking pipeline
-- Tracks the full booking lifecycle once a vendor sends a quote to a couple.
-- Linked to an inquiry via inquiry_id; standalone bookings (off-platform leads) are also allowed.

CREATE TABLE vendor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,

  -- Event
  event_date DATE NOT NULL,
  start_time TEXT NOT NULL,   -- HH:MM 24h
  end_time TEXT NOT NULL,

  -- Couple
  partner_a TEXT NOT NULL,
  partner_b TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT NOT NULL,

  -- Package / venue
  package_name TEXT NOT NULL,
  location TEXT NOT NULL,

  -- Pipeline stage (vendor-facing simplified view)
  stage TEXT NOT NULL DEFAULT 'quoted'
    CHECK (stage IN ('quoted', 'reserved', 'confirmed', 'completed', 'cancelled')),

  -- Internal status (granular state machine)
  internal_status TEXT NOT NULL DEFAULT 'quote_sent'
    CHECK (internal_status IN (
      'quote_sent', 'quote_accepted', 'contract_sent', 'contract_signed',
      'deposit_pending', 'confirmed', 'reschedule_requested', 'rescheduled',
      'completed', 'cancelled'
    )),

  -- Pricing — TZS integers
  total_value INTEGER NOT NULL CHECK (total_value >= 0),
  deposit_percent INTEGER NOT NULL DEFAULT 50 CHECK (deposit_percent BETWEEN 0 AND 100),
  deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
  balance_due_date DATE,

  -- Documents
  contract_sent_at TIMESTAMPTZ,
  contract_signed BOOLEAN NOT NULL DEFAULT FALSE,
  invoice_issued BOOLEAN NOT NULL DEFAULT FALSE,
  brief_submitted BOOLEAN NOT NULL DEFAULT FALSE,

  -- Slot hold (reserved-stage hold expiry)
  slot_held_until TIMESTAMPTZ,

  -- Messaging (denormalized preview for pipeline list performance)
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,

  -- Post-event
  review_requested BOOLEAN NOT NULL DEFAULT FALSE,
  review_received BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timeline events — [{at, kind, label}]
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Cancellation
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_vendor_bookings_updated
  BEFORE UPDATE ON vendor_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE vendor_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendors_select_own_bookings" ON vendor_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_bookings.vendor_id
        AND vendors.user_id = requesting_user_id()
    )
  );

CREATE POLICY "vendors_insert_own_bookings" ON vendor_bookings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_bookings.vendor_id
        AND vendors.user_id = requesting_user_id()
    )
  );

CREATE POLICY "vendors_update_own_bookings" ON vendor_bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_bookings.vendor_id
        AND vendors.user_id = requesting_user_id()
    )
  );

CREATE POLICY "service_role_all_vendor_bookings" ON vendor_bookings
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX idx_vendor_bookings_vendor_id ON vendor_bookings(vendor_id);
CREATE INDEX idx_vendor_bookings_event_date ON vendor_bookings(event_date);
CREATE INDEX idx_vendor_bookings_stage ON vendor_bookings(stage);
CREATE INDEX idx_vendor_bookings_created_at ON vendor_bookings(created_at DESC);
