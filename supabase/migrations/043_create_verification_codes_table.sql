-- Verification codes table for email verification
-- This migration creates a table to store verification codes for email confirmation

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL, -- Hashed verification code
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  attempts INT DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);

-- Create index on verified status for cleanup queries
CREATE INDEX IF NOT EXISTS idx_verification_codes_verified ON verification_codes(verified);

-- Enable RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Service role can manage verification codes" ON verification_codes;

-- RLS Policy: Users can only view their own verification codes
CREATE POLICY "Users can view their own verification codes"
  ON verification_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role can manage verification codes"
  ON verification_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to clean up expired codes (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < NOW() OR verified = true;
END;
$$;

-- Add comment to table
COMMENT ON TABLE verification_codes IS 'Stores email verification codes for user signup';
COMMENT ON COLUMN verification_codes.code_hash IS 'Bcrypt hashed 6-digit verification code';
COMMENT ON COLUMN verification_codes.expires_at IS 'Code expiration timestamp (10 minutes from creation)';
COMMENT ON COLUMN verification_codes.attempts IS 'Number of verification attempts made';
COMMENT ON COLUMN verification_codes.verified IS 'Whether this code has been successfully verified';
