ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS proposal_status TEXT,
  ADD COLUMN IF NOT EXISTS proposal_event_date DATE,
  ADD COLUMN IF NOT EXISTS proposal_venue TEXT,
  ADD COLUMN IF NOT EXISTS proposal_guest_count INTEGER,
  ADD COLUMN IF NOT EXISTS proposal_package TEXT,
  ADD COLUMN IF NOT EXISTS proposal_invoice_amount INTEGER,
  ADD COLUMN IF NOT EXISTS proposal_invoice_details TEXT,
  ADD COLUMN IF NOT EXISTS proposal_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS proposal_counter_amount INTEGER,
  ADD COLUMN IF NOT EXISTS proposal_counter_message TEXT,
  ADD COLUMN IF NOT EXISTS proposal_countered_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS proposal_accepted_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inquiries_proposal_status_check'
  ) THEN
    ALTER TABLE inquiries
      ADD CONSTRAINT inquiries_proposal_status_check
      CHECK (
        proposal_status IS NULL
        OR proposal_status IN ('sent', 'countered', 'accepted')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inquiries_proposal_guest_count_check'
  ) THEN
    ALTER TABLE inquiries
      ADD CONSTRAINT inquiries_proposal_guest_count_check
      CHECK (proposal_guest_count IS NULL OR proposal_guest_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inquiries_proposal_invoice_amount_check'
  ) THEN
    ALTER TABLE inquiries
      ADD CONSTRAINT inquiries_proposal_invoice_amount_check
      CHECK (proposal_invoice_amount IS NULL OR proposal_invoice_amount >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inquiries_proposal_counter_amount_check'
  ) THEN
    ALTER TABLE inquiries
      ADD CONSTRAINT inquiries_proposal_counter_amount_check
      CHECK (proposal_counter_amount IS NULL OR proposal_counter_amount >= 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_inquiries_proposal_status
  ON inquiries(proposal_status)
  WHERE proposal_status IS NOT NULL;

COMMENT ON COLUMN inquiries.proposal_status IS 'Proposal lifecycle: sent, countered, accepted';
COMMENT ON COLUMN inquiries.proposal_counter_message IS 'Client counter note pending vendor decision';