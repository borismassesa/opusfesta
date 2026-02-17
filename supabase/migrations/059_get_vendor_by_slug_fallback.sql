-- Resolve vendor by slugified business_name for legacy name-based slugs.
-- Used when exact slug match fails. Performs match in DB (no client-side scan).
CREATE OR REPLACE FUNCTION get_vendor_by_slug_fallback(slug_param TEXT)
RETURNS SETOF vendors
LANGUAGE sql
STABLE
AS $$
  SELECT v.*
  FROM vendors v
  WHERE slug_param ~ '^[a-z0-9-]+$'
    AND TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(COALESCE(v.business_name, ''), '[^a-zA-Z0-9]+', '-', 'g'))) = slug_param
  LIMIT 1;
$$;
