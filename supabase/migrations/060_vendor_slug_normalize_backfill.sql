-- Normalize and backfill vendor slugs for consistent public routing.
-- Ensures slugs are lowercase, trimmed, and future updates stay canonical.
-- Requires: 001_initial_schema, 059_get_vendor_by_slug_fallback (for same slug logic).

-- 1. Function to derive canonical slug from a name (matches get_vendor_by_slug_fallback logic).
CREATE OR REPLACE FUNCTION canonical_vendor_slug(name_text TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT LOWER(TRIM(BOTH '-' FROM REGEXP_REPLACE(COALESCE(name_text, ''), '[^a-zA-Z0-9]+', '-', 'g')));
$$;

-- 2. Backfill: normalize existing slugs to lowercase and trim; resolve duplicates with id suffix.
WITH normalized AS (
  SELECT
    id,
    slug,
    LOWER(TRIM(slug)) AS new_slug,
    ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(slug)) ORDER BY created_at, id) AS rn
  FROM vendors
),
targets AS (
  SELECT
    id,
    CASE
      WHEN rn = 1 AND new_slug <> '' THEN new_slug
      WHEN new_slug <> '' THEN new_slug || '-' || LEFT(id::text, 8)
      ELSE canonical_vendor_slug((SELECT business_name FROM vendors v2 WHERE v2.id = normalized.id))
    END AS target_slug
  FROM normalized
  WHERE slug IS DISTINCT FROM (
    CASE
      WHEN rn = 1 AND new_slug <> '' THEN new_slug
      WHEN new_slug <> '' THEN new_slug || '-' || LEFT(id::text, 8)
      ELSE canonical_vendor_slug((SELECT business_name FROM vendors v2 WHERE v2.id = normalized.id))
    END
  )
)
UPDATE vendors v
SET slug = t.target_slug
FROM targets t
WHERE v.id = t.id;

-- 3. Trigger function: keep slug canonical (lowercase, trim). On INSERT only, derive from business_name if slug empty.
CREATE OR REPLACE FUNCTION normalize_vendor_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
BEGIN
  base_slug := LOWER(TRIM(COALESCE(NEW.slug, '')));
  IF base_slug = '' THEN
    IF TG_OP = 'INSERT' THEN
      base_slug := canonical_vendor_slug(NEW.business_name);
    END IF;
    IF base_slug = '' THEN
      base_slug := 'vendor-' || LEFT(COALESCE(NEW.id, gen_random_uuid())::text, 8);
    END IF;
  END IF;
  NEW.slug := base_slug;
  RETURN NEW;
END;
$$;

-- Only create trigger if it doesn't exist (idempotent).
DROP TRIGGER IF EXISTS normalize_vendor_slug_trigger ON vendors;
CREATE TRIGGER normalize_vendor_slug_trigger
  BEFORE INSERT OR UPDATE OF slug, business_name ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION normalize_vendor_slug();

COMMENT ON FUNCTION canonical_vendor_slug IS 'Derive URL-safe slug from name; matches get_vendor_by_slug_fallback';
COMMENT ON FUNCTION normalize_vendor_slug IS 'Trigger: keep vendors.slug lowercase and trimmed for public routing';
