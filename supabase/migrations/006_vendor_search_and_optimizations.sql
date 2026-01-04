-- Migration 006: Vendor Search and Performance Optimizations
-- This migration adds search functionality and fixes performance issues
--
-- PREREQUISITE: This migration requires migration 001_initial_schema.sql to be run first
-- The vendors, users, and reviews tables must exist before running this migration
--
-- To check if prerequisites are met, run:
-- SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendors');

-- Check if vendors table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendors') THEN
    RAISE EXCEPTION 'Prerequisite not met: vendors table does not exist. Please run migration 001_initial_schema.sql first.';
  END IF;
END $$;

-- 1. Create vendor search RPC function with full-text search, filters, and sorting
CREATE OR REPLACE FUNCTION search_vendors(
  search_query TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  location_filter TEXT DEFAULT NULL,
  price_range_filter TEXT DEFAULT NULL,
  verified_filter BOOLEAN DEFAULT NULL,
  sort_by TEXT DEFAULT 'recommended',
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  slug VARCHAR,
  business_name VARCHAR,
  category TEXT,
  location JSONB,
  price_range TEXT,
  verified BOOLEAN,
  stats JSONB,
  cover_image TEXT,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $function$
DECLARE
  offset_value INTEGER;
BEGIN
  offset_value := (page_number - 1) * page_size;

  RETURN QUERY
  WITH filtered_vendors AS (
    SELECT 
      v.id,
      v.slug,
      v.business_name,
      v.category::TEXT,
      v.location,
      v.price_range::TEXT,
      v.verified,
      v.stats,
      v.cover_image,
      v.logo,
      v.created_at,
      COUNT(*) OVER() AS total_count
    FROM vendors v
    WHERE 
      -- Search query (full-text search on business_name, description, bio)
      (search_query IS NULL OR 
       v.business_name ILIKE '%' || search_query || '%' OR
       v.description ILIKE '%' || search_query || '%' OR
       v.bio ILIKE '%' || search_query || '%')
      -- Category filter
      AND (category_filter IS NULL OR v.category::TEXT = category_filter)
      -- Location filter (check city in location JSONB)
      AND (location_filter IS NULL OR v.location->>'city' = location_filter)
      -- Price range filter
      AND (price_range_filter IS NULL OR v.price_range::TEXT = price_range_filter)
      -- Verified filter
      AND (verified_filter IS NULL OR v.verified = verified_filter)
      -- Only show verified vendors by default
      AND v.verified = true
  )
  SELECT 
    fv.id,
    fv.slug,
    fv.business_name,
    fv.category,
    fv.location,
    fv.price_range,
    fv.verified,
    fv.stats,
    fv.cover_image,
    fv.logo,
    fv.created_at,
    fv.total_count
  FROM filtered_vendors fv
  ORDER BY
    CASE 
      WHEN sort_by = 'rating' THEN (fv.stats->>'averageRating')::NUMERIC
      WHEN sort_by = 'reviews' THEN (fv.stats->>'reviewCount')::INTEGER
      WHEN sort_by = 'priceAsc' THEN 
        CASE fv.price_range::TEXT
          WHEN '$' THEN 1
          WHEN '$$' THEN 2
          WHEN '$$$' THEN 3
          WHEN '$$$$' THEN 4
          ELSE 5
        END
      WHEN sort_by = 'priceDesc' THEN 
        CASE fv.price_range::TEXT
          WHEN '$$$$' THEN 1
          WHEN '$$$' THEN 2
          WHEN '$$' THEN 3
          WHEN '$' THEN 4
          ELSE 5
        END
      ELSE (fv.stats->>'averageRating')::NUMERIC
    END DESC,
    CASE 
      WHEN sort_by = 'recommended' THEN (fv.stats->>'reviewCount')::INTEGER
      WHEN sort_by = 'rating' THEN (fv.stats->>'reviewCount')::INTEGER
      ELSE NULL
    END DESC NULLS LAST,
    fv.created_at DESC
  LIMIT page_size
  OFFSET offset_value;
END;
$function$ LANGUAGE plpgsql;

-- 2. Fix N+1 query issue: Create function to get reviews with user data in one query
CREATE OR REPLACE FUNCTION get_vendor_reviews_with_users(vendor_id_param UUID)
RETURNS TABLE (
  id UUID,
  vendor_id UUID,
  user_id UUID,
  rating INTEGER,
  title TEXT,
  content TEXT,
  images TEXT[],
  event_type TEXT,
  event_date DATE,
  verified BOOLEAN,
  helpful INTEGER,
  vendor_response TEXT,
  vendor_responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_name VARCHAR,
  user_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.vendor_id,
    r.user_id,
    r.rating,
    r.title,
    r.content,
    r.images,
    r.event_type,
    r.event_date,
    r.verified,
    r.helpful,
    r.vendor_response,
    r.vendor_responded_at,
    r.created_at,
    r.updated_at,
    COALESCE(u.name, 'Anonymous') AS user_name,
    u.avatar AS user_avatar
  FROM reviews r
  LEFT JOIN users u ON r.user_id = u.id
  WHERE r.vendor_id = vendor_id_param
    AND r.verified = true
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Create atomic increment function for view counts
CREATE OR REPLACE FUNCTION increment_vendor_view_count(vendor_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE vendors
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    '{viewCount}',
    to_jsonb(COALESCE((stats->>'viewCount')::INTEGER, 0) + 1)
  )
  WHERE id = vendor_id_param;
END;
$$ LANGUAGE plpgsql;

-- 4. Create atomic increment function for save counts
CREATE OR REPLACE FUNCTION increment_vendor_save_count(vendor_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE vendors
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    '{saveCount}',
    to_jsonb(COALESCE((stats->>'saveCount')::INTEGER, 0) + 1)
  )
  WHERE id = vendor_id_param;
END;
$$ LANGUAGE plpgsql;

-- 5. Create atomic decrement function for save counts
CREATE OR REPLACE FUNCTION decrement_vendor_save_count(vendor_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE vendors
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    '{saveCount}',
    to_jsonb(GREATEST(COALESCE((stats->>'saveCount')::INTEGER, 0) - 1, 0))
  )
  WHERE id = vendor_id_param;
END;
$$ LANGUAGE plpgsql;

-- 6. Add additional indexes for search performance
CREATE INDEX IF NOT EXISTS idx_vendors_business_name ON vendors USING gin(to_tsvector('english', business_name));
CREATE INDEX IF NOT EXISTS idx_vendors_description ON vendors USING gin(to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_vendors_price_range ON vendors(price_range) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_vendors_stats_rating ON vendors((stats->>'averageRating')) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_vendors_stats_reviews ON vendors((stats->>'reviewCount')) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at DESC) WHERE verified = true;

-- 7. Add index on location->>'city' for location filtering
CREATE INDEX IF NOT EXISTS idx_vendors_location_city ON vendors((location->>'city')) WHERE verified = true;

-- 8. Add composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_vendors_category_location ON vendors(category, (location->>'city')) WHERE verified = true;

COMMENT ON FUNCTION search_vendors IS 'Search vendors with filters, sorting, and pagination';
COMMENT ON FUNCTION get_vendor_reviews_with_users IS 'Get vendor reviews with user data in a single query (fixes N+1 issue)';
COMMENT ON FUNCTION increment_vendor_view_count IS 'Atomically increment vendor view count';
COMMENT ON FUNCTION increment_vendor_save_count IS 'Atomically increment vendor save count';
COMMENT ON FUNCTION decrement_vendor_save_count IS 'Atomically decrement vendor save count';
