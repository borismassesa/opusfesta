-- Add payment preferences to inquiries table
-- NOTE: Payment information is NOT collected during inquiry submission.
-- Payment will only happen after vendor confirms the inquiry (status = 'accepted').
-- These fields are kept for future use but are currently set to NULL during inquiry creation.

ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS payment_preference VARCHAR(50), -- 'full', 'partial', 'installments' (currently unused)
ADD COLUMN IF NOT EXISTS preferred_payment_method VARCHAR(50), -- 'card', 'mpesa', 'tigopesa', 'airtelmoney', 'halopesa' (currently unused)
ADD COLUMN IF NOT EXISTS payment_metadata JSONB DEFAULT '{}'; -- Store additional payment info (currently unused)

-- Add comment
COMMENT ON COLUMN inquiries.payment_preference IS 'Customer payment preference: full (pay now), partial (pay part now), or installments. Currently unused - payment happens after vendor confirmation.';
COMMENT ON COLUMN inquiries.preferred_payment_method IS 'Customer preferred payment method. Currently unused - payment happens after vendor confirmation.';
COMMENT ON COLUMN inquiries.payment_metadata IS 'Additional payment information. Currently unused - payment happens after vendor confirmation.';
