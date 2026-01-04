-- Mobile Money Payment Numbers (LIPA Namba)
-- Allows vendors to provide mobile money payment numbers for direct payments

-- Add mobile money payment numbers to vendors table
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS mobile_money_accounts JSONB DEFAULT '[]';

-- Example structure for mobile_money_accounts:
-- [
--   {
--     "provider": "MPESA",
--     "phone_number": "+255123456789",
--     "account_name": "Business Name",
--     "is_primary": true
--   },
--   {
--     "provider": "AIRTEL_MONEY",
--     "phone_number": "+255987654321",
--     "account_name": "Business Name",
--     "is_primary": false
--   }
-- ]

-- Create index for querying mobile money accounts
CREATE INDEX IF NOT EXISTS idx_vendors_mobile_money ON vendors USING GIN (mobile_money_accounts);

-- Payment receipts table for manual verification
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Receipt details
  receipt_image_url TEXT NOT NULL, -- URL to uploaded receipt image
  receipt_number TEXT, -- Transaction ID from mobile money
  payment_provider VARCHAR(50) NOT NULL, -- MPESA, AIRTEL_MONEY, TIGO_PESA, etc.
  phone_number VARCHAR(20), -- Customer's phone number used for payment
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  payment_date DATE, -- Date from receipt
  
  -- Verification
  status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  rejection_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for payment receipts
CREATE INDEX IF NOT EXISTS idx_payment_receipts_payment_id ON payment_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_invoice_id ON payment_receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_vendor_id ON payment_receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_user_id ON payment_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_status ON payment_receipts(status);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_created_at ON payment_receipts(created_at DESC);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_payment_receipts_updated_at ON payment_receipts;
CREATE TRIGGER update_payment_receipts_updated_at BEFORE UPDATE ON payment_receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to verify payment receipt
CREATE OR REPLACE FUNCTION verify_payment_receipt(
  receipt_uuid UUID,
  verifier_uuid UUID,
  is_approved BOOLEAN,
  notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  receipt_rec payment_receipts;
  payment_rec payments;
BEGIN
  -- Get receipt
  SELECT * INTO receipt_rec FROM payment_receipts WHERE id = receipt_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Receipt not found';
  END IF;
  
  IF receipt_rec.status != 'pending' THEN
    RAISE EXCEPTION 'Receipt already verified';
  END IF;
  
  -- Update receipt
  UPDATE payment_receipts
  SET 
    status = CASE WHEN is_approved THEN 'verified' ELSE 'rejected' END,
    verified_by = verifier_uuid,
    verified_at = CURRENT_TIMESTAMP,
    verification_notes = notes,
    rejection_reason = CASE WHEN NOT is_approved THEN notes ELSE NULL END
  WHERE id = receipt_uuid;
  
  -- If approved, update payment status
  IF is_approved THEN
    -- Get payment
    SELECT * INTO payment_rec FROM payments WHERE id = receipt_rec.payment_id;
    
    -- Update payment to succeeded
    UPDATE payments
    SET 
      status = 'SUCCEEDED',
      processed_at = CURRENT_TIMESTAMP,
      provider_ref = receipt_rec.receipt_number,
      provider_metadata = jsonb_build_object(
        'receipt_id', receipt_uuid,
        'receipt_number', receipt_rec.receipt_number,
        'payment_provider', receipt_rec.payment_provider,
        'phone_number', receipt_rec.phone_number,
        'verified_by', verifier_uuid,
        'verified_at', CURRENT_TIMESTAMP
      )
    WHERE id = receipt_rec.payment_id;
    
    -- The payment split trigger will automatically create revenue records
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on payment_receipts
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_receipts
-- Users can view their own receipts
DROP POLICY IF EXISTS "Users can view their own receipts" ON payment_receipts;
CREATE POLICY "Users can view their own receipts" ON payment_receipts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Vendors can view receipts for their invoices
DROP POLICY IF EXISTS "Vendors can view receipts for their invoices" ON payment_receipts;
CREATE POLICY "Vendors can view receipts for their invoices" ON payment_receipts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = payment_receipts.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Users can create receipts for their payments
DROP POLICY IF EXISTS "Users can create receipts" ON payment_receipts;
CREATE POLICY "Users can create receipts" ON payment_receipts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Vendors and admins can verify receipts
DROP POLICY IF EXISTS "Vendors and admins can verify receipts" ON payment_receipts;
CREATE POLICY "Vendors and admins can verify receipts" ON payment_receipts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = payment_receipts.vendor_id
      AND vendors.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can view all receipts
DROP POLICY IF EXISTS "Admins can view all receipts" ON payment_receipts;
CREATE POLICY "Admins can view all receipts" ON payment_receipts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
