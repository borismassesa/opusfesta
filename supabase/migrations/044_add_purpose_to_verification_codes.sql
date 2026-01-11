-- Add purpose column to verification_codes table
-- This allows the table to be used for both email verification and password reset

-- Add purpose column with default value
ALTER TABLE verification_codes 
ADD COLUMN IF NOT EXISTS purpose VARCHAR(50) DEFAULT 'email_verification';

-- Update existing records to have email_verification purpose
UPDATE verification_codes 
SET purpose = 'email_verification' 
WHERE purpose IS NULL;

-- Add constraint to ensure purpose is one of the allowed values
ALTER TABLE verification_codes 
DROP CONSTRAINT IF EXISTS verification_codes_purpose_check;

ALTER TABLE verification_codes 
ADD CONSTRAINT verification_codes_purpose_check 
CHECK (purpose IN ('email_verification', 'password_reset'));

-- Create index on purpose for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_purpose ON verification_codes(purpose);

-- Create composite index for email + purpose lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_purpose ON verification_codes(email, purpose);

-- Update table comment
COMMENT ON COLUMN verification_codes.purpose IS 'Purpose of the verification code: email_verification or password_reset';
