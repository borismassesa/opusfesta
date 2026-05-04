-- OF-VND-0006 GAP 2a: capacity, map coordinates, and gallery uploads
--
-- These three fields are visible on the public vendor profile but the
-- onboarding flow doesn't yet collect them. We add the columns now so
-- admin operations can fill them in (and so a future onboarding step has
-- somewhere to write to). Each is nullable — vendors without the data
-- continue to render an empty/placeholder state.

ALTER TABLE public.vendors
  -- Guest-count range, e.g. {"min":60, "max":200}. JSONB rather than two
  -- columns so future fields (recommended seating style, ceremony vs
  -- reception capacity) can extend without another migration.
  ADD COLUMN IF NOT EXISTS capacity JSONB,
  -- Decimal degrees, validated only at the application layer for now.
  -- Numeric(9,6) gives ~10 cm precision, plenty for an event-venue marker.
  ADD COLUMN IF NOT EXISTS lat NUMERIC(9, 6),
  ADD COLUMN IF NOT EXISTS lng NUMERIC(9, 6),
  -- Public photo gallery — array of fully-qualified URLs (CDN-served).
  -- The single `cover_image` / `logo` columns stay for the hero image; this
  -- is the rest of the portfolio.
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[];

COMMENT ON COLUMN public.vendors.capacity
  IS 'Guest-count range as {"min":N,"max":N}. Hidden on public profile when null.';
COMMENT ON COLUMN public.vendors.lat
  IS 'Map latitude in decimal degrees. Pair with vendors.lng. Null when unknown.';
COMMENT ON COLUMN public.vendors.lng
  IS 'Map longitude in decimal degrees. Pair with vendors.lat. Null when unknown.';
COMMENT ON COLUMN public.vendors.gallery_urls
  IS 'Public portfolio gallery, fully-qualified URLs. Hero stays in cover_image/logo.';

NOTIFY pgrst, 'reload schema';
