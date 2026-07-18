-- Gift registry — distinguish cash funds (honeymoon, house deposit, etc.)
-- from physical gifts, mirroring Zola's "Cash Funds" category. Claiming
-- still works the same single-claim way as any other item (no pooled
-- payments) — this is purely a categorization flag for the manage-registry
-- stats split and a badge on guest-facing cards.

ALTER TABLE gift_registry_items
  ADD COLUMN IF NOT EXISTS is_cash_fund BOOLEAN NOT NULL DEFAULT false;

NOTIFY pgrst, 'reload schema';
