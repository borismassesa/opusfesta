-- TheFesta Mobile Money Accounts
-- Platform mobile money payment numbers (LIPA Namba) for receiving payments

-- Create table for TheFesta's mobile money accounts
CREATE TABLE IF NOT EXISTS platform_mobile_money_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL, -- MPESA, AIRTEL_MONEY, TIGO_PESA, HALO_PESA
  lipa_namba VARCHAR(20) NOT NULL UNIQUE, -- Payment code (e.g., "57020159", "12802655")
  account_name VARCHAR(255) NOT NULL DEFAULT 'TheFesta',
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false, -- Primary account for each provider
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for active accounts
CREATE INDEX IF NOT EXISTS idx_platform_mobile_money_active ON platform_mobile_money_accounts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_platform_mobile_money_provider ON platform_mobile_money_accounts(provider);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_platform_mobile_money_updated_at ON platform_mobile_money_accounts;
CREATE TRIGGER update_platform_mobile_money_updated_at BEFORE UPDATE ON platform_mobile_money_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get active mobile money accounts
CREATE OR REPLACE FUNCTION get_active_mobile_money_accounts()
RETURNS TABLE (
  provider VARCHAR(50),
  lipa_namba VARCHAR(20),
  account_name VARCHAR(255),
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pmm.provider,
    pmm.lipa_namba,
    pmm.account_name,
    pmm.is_primary
  FROM platform_mobile_money_accounts pmm
  WHERE pmm.is_active = true
  ORDER BY pmm.is_primary DESC, pmm.provider;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS (public read, admin write)
ALTER TABLE platform_mobile_money_accounts ENABLE ROW LEVEL SECURITY;

-- Anyone can view active accounts (for payment instructions)
DROP POLICY IF EXISTS "Anyone can view active mobile money accounts" ON platform_mobile_money_accounts;
CREATE POLICY "Anyone can view active mobile money accounts" ON platform_mobile_money_accounts
  FOR SELECT
  USING (is_active = true);

-- Admins can manage accounts
DROP POLICY IF EXISTS "Admins can manage mobile money accounts" ON platform_mobile_money_accounts;
CREATE POLICY "Admins can manage mobile money accounts" ON platform_mobile_money_accounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert default accounts (to be updated by admin)
-- These are placeholders - admin should update with actual LIPA NAMBA codes
INSERT INTO platform_mobile_money_accounts (provider, lipa_namba, account_name, is_active, is_primary) VALUES
  ('MPESA', '00000000', 'TheFesta', true, true),
  ('AIRTEL_MONEY', '00000000', 'TheFesta', true, true),
  ('TIGO_PESA', '00000000', 'TheFesta', true, true),
  ('HALO_PESA', '00000000', 'TheFesta', true, true)
ON CONFLICT (lipa_namba) DO NOTHING;
