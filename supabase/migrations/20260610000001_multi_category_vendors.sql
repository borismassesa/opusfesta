-- Multi-category vendors: one account (one email) may run several vendor
-- profiles — one per category (e.g. Transportation + Bridal Salons).
--
-- Replaces the one-vendor-per-user rule from 047_prevent_duplicate_vendors:
-- the old UNIQUE(user_id) made a second registration with the same email
-- impossible, forcing multi-service vendors to juggle multiple emails.
-- Uniqueness is now per (user_id, category), so re-submits still update the
-- same profile instead of duplicating it.

-- Backs the onboarding "Others" card. The vendor's real category arrives as
-- free text in application_snapshot (customCategory) and admin recategorizes
-- to a proper enum value during review if one fits.
ALTER TYPE vendor_category ADD VALUE IF NOT EXISTS 'Other';

ALTER TABLE vendors DROP CONSTRAINT IF EXISTS unique_vendor_per_user;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_vendor_per_user_category'
  ) THEN
    ALTER TABLE vendors
      ADD CONSTRAINT unique_vendor_per_user_category UNIQUE (user_id, category);
  END IF;
END $$;

-- idx_vendors_user_id_unique (a plain index from 047) is kept — portal
-- lookups still filter by user_id alone.
