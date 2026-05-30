-- Structured pledge payment methods (provider + account/number + account name)
-- so the "How to pay" block can be edited as rows and rendered cleanly on the
-- public pledge page (logos/provider, account, name) instead of free text.
-- pledge_payment_instructions (TEXT) is kept and auto-derived from these on save
-- so reminder messages and older readers keep working.

ALTER TABLE couple_profiles
  ADD COLUMN IF NOT EXISTS pledge_payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb;
