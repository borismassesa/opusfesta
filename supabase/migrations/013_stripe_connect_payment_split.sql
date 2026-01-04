-- Stripe Connect and Payment Split System
-- Implements 10% platform fee with vendor payouts

-- Add Stripe Connect fields to vendors table
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(50) DEFAULT 'pending', -- pending, active, restricted
  ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;

-- Create index for Stripe account lookups
CREATE INDEX IF NOT EXISTS idx_vendors_stripe_account_id ON vendors(stripe_account_id);

-- Add payment split fields to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS platform_fee_amount DECIMAL(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vendor_amount DECIMAL(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee_percentage DECIMAL(5, 2) DEFAULT 10.00, -- 10% default
  ADD COLUMN IF NOT EXISTS transfer_id VARCHAR(255), -- Stripe transfer ID to vendor
  ADD COLUMN IF NOT EXISTS transfer_status VARCHAR(50), -- pending, paid, failed
  ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMP WITH TIME ZONE;

-- Create index for transfer lookups
CREATE INDEX IF NOT EXISTS idx_payments_transfer_id ON payments(transfer_id);
CREATE INDEX IF NOT EXISTS idx_payments_transfer_status ON payments(transfer_status);

-- Platform revenue tracking table
CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  status VARCHAR(50) DEFAULT 'pending', -- pending, collected, refunded
  collected_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendor revenue tracking table
CREATE TABLE IF NOT EXISTS vendor_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL, -- Vendor's share (90%)
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  platform_fee DECIMAL(12, 2) NOT NULL, -- Platform fee (10%)
  total_payment DECIMAL(12, 2) NOT NULL, -- Total payment amount
  transfer_id VARCHAR(255), -- Stripe transfer ID
  transfer_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
  transferred_at TIMESTAMP WITH TIME ZONE,
  payout_method VARCHAR(50), -- stripe, bank_transfer, etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for revenue tracking
CREATE INDEX IF NOT EXISTS idx_platform_revenue_payment_id ON platform_revenue(payment_id);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_vendor_id ON platform_revenue(vendor_id);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_status ON platform_revenue(status);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_created_at ON platform_revenue(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vendor_revenue_vendor_id ON vendor_revenue(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_revenue_payment_id ON vendor_revenue(payment_id);
CREATE INDEX IF NOT EXISTS idx_vendor_revenue_transfer_status ON vendor_revenue(transfer_status);
CREATE INDEX IF NOT EXISTS idx_vendor_revenue_created_at ON vendor_revenue(created_at DESC);

-- Triggers
DROP TRIGGER IF EXISTS update_platform_revenue_updated_at ON platform_revenue;
CREATE TRIGGER update_platform_revenue_updated_at BEFORE UPDATE ON platform_revenue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_revenue_updated_at ON vendor_revenue;
CREATE TRIGGER update_vendor_revenue_updated_at BEFORE UPDATE ON vendor_revenue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate payment split
CREATE OR REPLACE FUNCTION calculate_payment_split(
  payment_amount DECIMAL(12, 2),
  fee_percentage DECIMAL(5, 2) DEFAULT 10.00
)
RETURNS TABLE (
  platform_fee DECIMAL(12, 2),
  vendor_amount DECIMAL(12, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND((payment_amount * fee_percentage / 100)::numeric, 2) as platform_fee,
    ROUND((payment_amount * (100 - fee_percentage) / 100)::numeric, 2) as vendor_amount;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to create payment split records
CREATE OR REPLACE FUNCTION create_payment_split()
RETURNS TRIGGER AS $$
DECLARE
  split_result RECORD;
  vendor_stripe_account_id VARCHAR(255);
BEGIN
  -- Only process successful payments
  IF NEW.status != 'SUCCEEDED' OR OLD.status = 'SUCCEEDED' THEN
    RETURN NEW;
  END IF;

  -- Calculate split (10% platform, 90% vendor)
  SELECT * INTO split_result
  FROM calculate_payment_split(NEW.amount, 10.00);

  -- Update payment with split amounts
  NEW.platform_fee_amount := split_result.platform_fee;
  NEW.vendor_amount := split_result.vendor_amount;
  NEW.platform_fee_percentage := 10.00;

  -- Create platform revenue record
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
    'collected'
  )
  ON CONFLICT DO NOTHING;

  -- Get vendor's Stripe account ID
  SELECT stripe_account_id INTO vendor_stripe_account_id
  FROM vendors
  WHERE id = NEW.vendor_id;

  -- Create vendor revenue record
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
    payout_method
  ) VALUES (
    NEW.vendor_id,
    NEW.id,
    NEW.invoice_id,
    NEW.inquiry_id,
    split_result.vendor_amount,
    NEW.currency,
    split_result.platform_fee,
    NEW.amount,
    CASE
      WHEN vendor_stripe_account_id IS NOT NULL THEN 'pending'
      ELSE 'pending' -- Will be transferred when Stripe account is connected
    END,
    'stripe'
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create payment split on payment success
DROP TRIGGER IF EXISTS create_payment_split_trigger ON payments;
CREATE TRIGGER create_payment_split_trigger
  AFTER UPDATE OF status ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'SUCCEEDED' AND OLD.status != 'SUCCEEDED')
  EXECUTE FUNCTION create_payment_split();

-- Function to get vendor revenue summary
CREATE OR REPLACE FUNCTION get_vendor_revenue_summary(
  vendor_uuid UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_revenue DECIMAL(12, 2),
  total_platform_fees DECIMAL(12, 2),
  total_payments DECIMAL(12, 2),
  paid_out DECIMAL(12, 2),
  pending_payout DECIMAL(12, 2),
  payment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(vr.amount), 0) as total_revenue,
    COALESCE(SUM(vr.platform_fee), 0) as total_platform_fees,
    COALESCE(SUM(vr.total_payment), 0) as total_payments,
    COALESCE(SUM(CASE WHEN vr.transfer_status = 'paid' THEN vr.amount ELSE 0 END), 0) as paid_out,
    COALESCE(SUM(CASE WHEN vr.transfer_status = 'pending' THEN vr.amount ELSE 0 END), 0) as pending_payout,
    COUNT(*) as payment_count
  FROM vendor_revenue vr
  WHERE vr.vendor_id = vendor_uuid
    AND (start_date IS NULL OR DATE(vr.created_at) >= start_date)
    AND (end_date IS NULL OR DATE(vr.created_at) <= end_date);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get platform revenue summary
CREATE OR REPLACE FUNCTION get_platform_revenue_summary(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_revenue DECIMAL(12, 2),
  total_payments BIGINT,
  collected_revenue DECIMAL(12, 2),
  pending_revenue DECIMAL(12, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(pr.amount), 0) as total_revenue,
    COUNT(*) as total_payments,
    COALESCE(SUM(CASE WHEN pr.status = 'collected' THEN pr.amount ELSE 0 END), 0) as collected_revenue,
    COALESCE(SUM(CASE WHEN pr.status = 'pending' THEN pr.amount ELSE 0 END), 0) as pending_revenue
  FROM platform_revenue pr
  WHERE (start_date IS NULL OR DATE(pr.created_at) >= start_date)
    AND (end_date IS NULL OR DATE(pr.created_at) <= end_date);
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS on new tables
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_revenue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_revenue (admin only)
DROP POLICY IF EXISTS "Admins can view platform revenue" ON platform_revenue;
CREATE POLICY "Admins can view platform revenue" ON platform_revenue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for vendor_revenue
DROP POLICY IF EXISTS "Vendors can view their own revenue" ON vendor_revenue;
CREATE POLICY "Vendors can view their own revenue" ON vendor_revenue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_revenue.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all vendor revenue" ON vendor_revenue;
CREATE POLICY "Admins can view all vendor revenue" ON vendor_revenue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
