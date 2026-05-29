-- Pledge payment instructions: free-text "how to pay" details the couple shares
-- with contributors (e.g. mobile-money Lipa Namba for M-Pesa / Tigo Pesa / Airtel
-- Money, or a bank account). Shown on the public /pledge/<token> page and appended
-- to reminder messages so contributors know exactly where to send their pledge.
--
-- Free-text keeps it flexible across providers; OpusPass doesn't process the money
-- itself — the couple records what they receive.

ALTER TABLE couple_profiles
  ADD COLUMN IF NOT EXISTS pledge_payment_instructions TEXT;
