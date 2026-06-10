-- Multi-category vendors: one account (one email) may run several vendor
-- profiles — one per category (e.g. Transportation + Bridal Salons).
--
-- Replaces the one-vendor-per-user rule from 047_prevent_duplicate_vendors
-- (which some environments never applied): the old UNIQUE(user_id) made a
-- second registration with the same email impossible, forcing multi-service
-- vendors to juggle multiple emails. Uniqueness is now per (user_id,
-- category), so re-submits still update the same profile instead of
-- duplicating it.

-- Backs the onboarding "Others" card. The vendor's real category arrives as
-- free text in application_snapshot (customCategory) and admin recategorizes
-- to a proper enum value during review if one fits.
ALTER TYPE vendor_category ADD VALUE IF NOT EXISTS 'Other';

ALTER TABLE vendors DROP CONSTRAINT IF EXISTS unique_vendor_per_user;

-- Partial unique INDEX rather than a table constraint: the seed/demo user
-- (…0099) legitimately owns multiple demo storefronts per category, which a
-- blanket constraint would reject. Real users are fully covered.
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendors_user_category_unique
  ON vendors (user_id, category)
  WHERE user_id IS NOT NULL
    AND user_id <> '00000000-0000-0000-0000-000000000099';

-- idx_vendors_user_id (a plain index) is kept — portal lookups still filter
-- by user_id alone.
