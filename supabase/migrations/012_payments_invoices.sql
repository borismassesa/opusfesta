-- Payments and Invoices System
-- Creates tables for invoice generation and payment processing

-- Payment method enum
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'MPESA',
    'AIRTEL_MONEY',
    'TIGO_PESA',
    'HALO_PESA',
    'STRIPE_CARD',
    'STRIPE_BANK',
    'PAYPAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment status enum
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCEEDED',
    'FAILED',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Invoice status enum
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM (
    'DRAFT',
    'PENDING',
    'PAID',
    'PARTIALLY_PAID',
    'OVERDUE',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Invoice type enum
DO $$ BEGIN
  CREATE TYPE invoice_type AS ENUM (
    'DEPOSIT',
    'FULL_PAYMENT',
    'BALANCE',
    'ADDITIONAL_SERVICE',
    'REFUND'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Invoice details
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  type invoice_type NOT NULL DEFAULT 'FULL_PAYMENT',
  status invoice_status NOT NULL DEFAULT 'DRAFT',
  
  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional info
  description TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  
  -- Provider information
  provider VARCHAR(50) NOT NULL, -- 'africas_talking', 'stripe', 'paypal'
  provider_ref VARCHAR(255), -- Transaction ID from provider
  provider_metadata JSONB DEFAULT '{}',
  
  -- Payment processing
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  refund_amount DECIMAL(12, 2) DEFAULT 0,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional info
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payouts Table (for vendor payouts)
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Payout details
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  
  -- Provider information
  provider VARCHAR(50) NOT NULL,
  provider_ref VARCHAR(255),
  provider_metadata JSONB DEFAULT '{}',
  
  -- Bank/Account details (encrypted or reference)
  account_number VARCHAR(255),
  account_name VARCHAR(255),
  bank_name VARCHAR(255),
  
  -- Processing
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  
  -- Additional info
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods Table (user saved payment methods)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Method details
  type payment_method NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_ref VARCHAR(255) NOT NULL, -- Card ID, phone number, etc.
  
  -- Display info
  display_name VARCHAR(255), -- "****1234", "+255 123 456 789", etc.
  is_default BOOLEAN DEFAULT false,
  
  -- Provider metadata
  provider_metadata JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Security
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, provider, provider_ref)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_inquiry_id ON invoices(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status IN ('PENDING', 'OVERDUE');

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_inquiry_id ON payments(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_vendor_id ON payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON payments(provider_ref);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payouts_vendor_id ON payouts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default) WHERE is_default = true;

-- Triggers
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payouts_updated_at ON payouts;
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-%';
  
  new_number := 'INV-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice paid amount
CREATE OR REPLACE FUNCTION update_invoice_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update invoice paid_amount when payment status changes
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE invoices
    SET paid_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM payments
      WHERE invoice_id = NEW.invoice_id
        AND status = 'SUCCEEDED'
    ),
    status = CASE
      WHEN (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE invoice_id = NEW.invoice_id
          AND status = 'SUCCEEDED'
      ) >= total_amount THEN 'PAID'::invoice_status
      WHEN (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE invoice_id = NEW.invoice_id
          AND status = 'SUCCEEDED'
      ) > 0 THEN 'PARTIALLY_PAID'::invoice_status
      ELSE status
    END,
    paid_at = CASE
      WHEN (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE invoice_id = NEW.invoice_id
          AND status = 'SUCCEEDED'
      ) >= total_amount THEN CURRENT_TIMESTAMP
      ELSE paid_at
    END
    WHERE id = NEW.invoice_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update invoice when payment status changes
DROP TRIGGER IF EXISTS update_invoice_on_payment ON payments;
CREATE TRIGGER update_invoice_on_payment
  AFTER INSERT OR UPDATE OF status, amount ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_paid_amount();

-- Function to mark overdue invoices
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE invoices
  SET status = 'OVERDUE'::invoice_status
  WHERE status = 'PENDING'::invoice_status
    AND due_date < CURRENT_DATE
    AND paid_amount < total_amount;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can view their invoices" ON invoices;
CREATE POLICY "Vendors can view their invoices" ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = invoices.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Vendors can create invoices" ON invoices;
CREATE POLICY "Vendors can create invoices" ON invoices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = invoices.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Vendors can update their invoices" ON invoices;
CREATE POLICY "Vendors can update their invoices" ON invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = invoices.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- RLS Policies for payments
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can view payments for their invoices" ON payments;
CREATE POLICY "Vendors can view payments for their invoices" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payments.invoice_id
      AND EXISTS (
        SELECT 1 FROM vendors
        WHERE vendors.id = invoices.vendor_id
        AND vendors.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can create payments" ON payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment methods
DROP POLICY IF EXISTS "Users can manage their own payment methods" ON payment_methods;
CREATE POLICY "Users can manage their own payment methods" ON payment_methods
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payouts
DROP POLICY IF EXISTS "Vendors can view their own payouts" ON payouts;
CREATE POLICY "Vendors can view their own payouts" ON payouts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = payouts.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Admins can view all
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all payouts" ON payouts;
CREATE POLICY "Admins can view all payouts" ON payouts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
