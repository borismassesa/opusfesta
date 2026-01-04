-- Escrow Payment Hold System
-- Payments are held by TheFesta and released to vendors after work completion
-- Similar to Uber/Airbnb model for vendor accountability

-- Update payments table to track escrow status
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(50) DEFAULT 'held', -- held, released, refunded
  ADD COLUMN IF NOT EXISTS held_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS release_reason TEXT;

-- Update vendor_revenue to track escrow status
ALTER TABLE vendor_revenue
  ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(50) DEFAULT 'held', -- held, released, refunded
  ADD COLUMN IF NOT EXISTS held_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS release_reason TEXT,
  ADD COLUMN IF NOT EXISTS work_completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS work_verified_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Escrow holds table (tracks all funds held by TheFesta)
CREATE TABLE IF NOT EXISTS escrow_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Hold details
  total_amount DECIMAL(12, 2) NOT NULL, -- Full payment amount
  platform_fee DECIMAL(12, 2) NOT NULL, -- 10% platform fee
  vendor_amount DECIMAL(12, 2) NOT NULL, -- 90% vendor amount
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  
  -- Status
  status VARCHAR(50) DEFAULT 'held', -- held, released, refunded, disputed
  held_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Work completion
  work_completed BOOLEAN DEFAULT false,
  work_completed_at TIMESTAMP WITH TIME ZONE,
  work_verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  work_verified_at TIMESTAMP WITH TIME ZONE,
  work_verification_notes TEXT,
  
  -- Release details
  release_method VARCHAR(50), -- automatic, manual, scheduled
  release_reason TEXT,
  released_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Dispute handling
  dispute_opened BOOLEAN DEFAULT false,
  dispute_resolved BOOLEAN DEFAULT false,
  dispute_resolution TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for escrow_holds
CREATE INDEX IF NOT EXISTS idx_escrow_holds_payment_id ON escrow_holds(payment_id);
CREATE INDEX IF NOT EXISTS idx_escrow_holds_invoice_id ON escrow_holds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_escrow_holds_vendor_id ON escrow_holds(vendor_id);
CREATE INDEX IF NOT EXISTS idx_escrow_holds_status ON escrow_holds(status);
CREATE INDEX IF NOT EXISTS idx_escrow_holds_work_completed ON escrow_holds(work_completed) WHERE work_completed = false;
CREATE INDEX IF NOT EXISTS idx_escrow_holds_created_at ON escrow_holds(created_at DESC);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_escrow_holds_updated_at ON escrow_holds;
CREATE TRIGGER update_escrow_holds_updated_at BEFORE UPDATE ON escrow_holds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create escrow hold when payment succeeds
CREATE OR REPLACE FUNCTION create_escrow_hold()
RETURNS TRIGGER AS $$
DECLARE
  split_result RECORD;
BEGIN
  -- Only process successful payments
  IF NEW.status != 'SUCCEEDED' OR OLD.status = 'SUCCEEDED' THEN
    RETURN NEW;
  END IF;

  -- Calculate split (10% platform, 90% vendor)
  SELECT * INTO split_result
  FROM calculate_payment_split(NEW.amount, 10.00);

  -- Create escrow hold record
  INSERT INTO escrow_holds (
    payment_id,
    invoice_id,
    inquiry_id,
    vendor_id,
    user_id,
    total_amount,
    platform_fee,
    vendor_amount,
    currency,
    status,
    held_at
  ) VALUES (
    NEW.id,
    NEW.invoice_id,
    NEW.inquiry_id,
    NEW.vendor_id,
    NEW.user_id,
    NEW.amount,
    split_result.platform_fee,
    split_result.vendor_amount,
    NEW.currency,
    'held',
    CURRENT_TIMESTAMP
  )
  ON CONFLICT DO NOTHING;

  -- Update payment with escrow status
  NEW.escrow_status := 'held';
  NEW.held_at := CURRENT_TIMESTAMP;

  -- Create platform revenue record (10% - immediately available)
  INSERT INTO platform_revenue (
    payment_id,
    vendor_id,
    amount,
    currency,
    fee_percentage,
    status
  ) VALUES (
    NEW.id,
    NEW.vendor_id,
    split_result.platform_fee,
    NEW.currency,
    10.00,
    'collected' -- Platform fee is collected immediately
  )
  ON CONFLICT DO NOTHING;

  -- Create vendor revenue record (90% - held in escrow)
  INSERT INTO vendor_revenue (
    vendor_id,
    payment_id,
    invoice_id,
    inquiry_id,
    amount,
    currency,
    platform_fee,
    total_payment,
    transfer_status,
    payout_method,
    escrow_status,
    held_at
  ) VALUES (
    NEW.vendor_id,
    NEW.id,
    NEW.invoice_id,
    NEW.inquiry_id,
    split_result.vendor_amount,
    NEW.currency,
    split_result.platform_fee,
    NEW.amount,
    'pending', -- Not transferred yet (held in escrow)
    'escrow',
    'held',
    CURRENT_TIMESTAMP
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create escrow hold on payment success
DROP TRIGGER IF EXISTS create_escrow_hold_trigger ON payments;
CREATE TRIGGER create_escrow_hold_trigger
  AFTER UPDATE OF status ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'SUCCEEDED' AND OLD.status != 'SUCCEEDED')
  EXECUTE FUNCTION create_escrow_hold();

-- Function to mark work as completed
CREATE OR REPLACE FUNCTION mark_work_completed(
  hold_uuid UUID,
  verifier_uuid UUID,
  verification_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE escrow_holds
  SET 
    work_completed = true,
    work_completed_at = CURRENT_TIMESTAMP,
    work_verified_by = verifier_uuid,
    work_verified_at = CURRENT_TIMESTAMP,
    work_verification_notes = verification_notes,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = hold_uuid
    AND work_completed = false;
END;
$$ LANGUAGE plpgsql;

-- Function to release escrow funds to vendor
-- Similar to Airbnb: holds funds until work completion, then releases
CREATE OR REPLACE FUNCTION release_escrow_funds(
  hold_uuid UUID,
  release_method VARCHAR(50) DEFAULT 'manual',
  release_reason TEXT DEFAULT NULL,
  released_by_uuid UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  hold_rec escrow_holds;
  vendor_stripe_account_id VARCHAR(255);
BEGIN
  -- Get hold record
  SELECT * INTO hold_rec FROM escrow_holds WHERE id = hold_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow hold not found';
  END IF;
  
  IF hold_rec.status != 'held' THEN
    RAISE EXCEPTION 'Escrow hold is not in held status';
  END IF;
  
  -- Work must be completed (like Airbnb requires check-in)
  IF NOT hold_rec.work_completed THEN
    RAISE EXCEPTION 'Work must be completed before releasing funds';
  END IF;
  
  -- Check if dispute is open (hold funds if disputed)
  IF hold_rec.dispute_opened AND NOT hold_rec.dispute_resolved THEN
    RAISE EXCEPTION 'Cannot release funds while dispute is open';
  END IF;

  -- Update escrow hold
  UPDATE escrow_holds
  SET 
    status = 'released',
    released_at = CURRENT_TIMESTAMP,
    release_method = release_method,
    release_reason = release_reason,
    released_by = released_by_uuid,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = hold_uuid;

  -- Update payment
  UPDATE payments
  SET 
    escrow_status = 'released',
    released_at = CURRENT_TIMESTAMP,
    release_reason = release_reason
  WHERE id = hold_rec.payment_id;

  -- Update vendor revenue
  UPDATE vendor_revenue
  SET 
    escrow_status = 'released',
    released_at = CURRENT_TIMESTAMP,
    release_reason = release_reason,
    transfer_status = 'pending' -- Will be transferred via Stripe Connect or bank
  WHERE payment_id = hold_rec.payment_id;

  -- If vendor has Stripe Connect, initiate transfer
  SELECT stripe_account_id INTO vendor_stripe_account_id
  FROM vendors
  WHERE id = hold_rec.vendor_id;

  -- Note: Actual Stripe transfer will be handled by API/webhook
  -- This function just marks the funds as ready for release
END;
$$ LANGUAGE plpgsql;

-- Function to refund escrow funds
CREATE OR REPLACE FUNCTION refund_escrow_funds(
  hold_uuid UUID,
  refund_reason TEXT DEFAULT NULL,
  refunded_by_uuid UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  hold_rec escrow_holds;
BEGIN
  -- Get hold record
  SELECT * INTO hold_rec FROM escrow_holds WHERE id = hold_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow hold not found';
  END IF;
  
  IF hold_rec.status NOT IN ('held', 'released') THEN
    RAISE EXCEPTION 'Escrow hold cannot be refunded in current status';
  END IF;

  -- Update escrow hold
  UPDATE escrow_holds
  SET 
    status = 'refunded',
    refunded_at = CURRENT_TIMESTAMP,
    release_reason = refund_reason,
    released_by = refunded_by_uuid,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = hold_uuid;

  -- Update payment
  UPDATE payments
  SET 
    escrow_status = 'refunded',
    status = 'REFUNDED',
    refund_amount = hold_rec.total_amount,
    refunded_at = CURRENT_TIMESTAMP
  WHERE id = hold_rec.payment_id;

  -- Update vendor revenue
  UPDATE vendor_revenue
  SET 
    escrow_status = 'refunded',
    transfer_status = 'cancelled'
  WHERE payment_id = hold_rec.payment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get escrow summary
CREATE OR REPLACE FUNCTION get_escrow_summary(
  vendor_uuid UUID DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_held DECIMAL(12, 2),
  total_released DECIMAL(12, 2),
  total_refunded DECIMAL(12, 2),
  pending_release DECIMAL(12, 2),
  hold_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN eh.status = 'held' THEN eh.vendor_amount ELSE 0 END), 0) as total_held,
    COALESCE(SUM(CASE WHEN eh.status = 'released' THEN eh.vendor_amount ELSE 0 END), 0) as total_released,
    COALESCE(SUM(CASE WHEN eh.status = 'refunded' THEN eh.vendor_amount ELSE 0 END), 0) as total_refunded,
    COALESCE(SUM(CASE WHEN eh.status = 'held' AND eh.work_completed = true THEN eh.vendor_amount ELSE 0 END), 0) as pending_release,
    COUNT(*) as hold_count
  FROM escrow_holds eh
  WHERE (vendor_uuid IS NULL OR eh.vendor_id = vendor_uuid)
    AND (start_date IS NULL OR DATE(eh.created_at) >= start_date)
    AND (end_date IS NULL OR DATE(eh.created_at) <= end_date);
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS on escrow_holds
ALTER TABLE escrow_holds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escrow_holds
-- Vendors can view their own escrow holds
DROP POLICY IF EXISTS "Vendors can view their escrow holds" ON escrow_holds;
CREATE POLICY "Vendors can view their escrow holds" ON escrow_holds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = escrow_holds.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Users can view escrow holds for their payments
DROP POLICY IF EXISTS "Users can view their escrow holds" ON escrow_holds;
CREATE POLICY "Users can view their escrow holds" ON escrow_holds
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all escrow holds
DROP POLICY IF EXISTS "Admins can view all escrow holds" ON escrow_holds;
CREATE POLICY "Admins can view all escrow holds" ON escrow_holds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Update the old payment split trigger to not create vendor revenue immediately
-- (Now handled by escrow system)
DROP TRIGGER IF EXISTS create_payment_split_trigger ON payments;
