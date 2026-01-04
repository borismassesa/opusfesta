-- Migration 007: Vendor Statistics Function
-- This migration creates a function to get platform-wide vendor statistics

-- Create function to get vendor statistics
CREATE OR REPLACE FUNCTION get_vendor_statistics()
RETURNS TABLE (
  total_vendors BIGINT,
  verified_vendors BIGINT,
  total_cities BIGINT,
  average_rating NUMERIC
) AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_vendors,
    COUNT(*) FILTER (WHERE verified = true)::BIGINT as verified_vendors,
    COUNT(DISTINCT location->>'city')::BIGINT as total_cities,
    ROUND(
      COALESCE(
        AVG((stats->>'averageRating')::NUMERIC) FILTER (WHERE (stats->>'averageRating')::NUMERIC > 0),
        0
      ),
      1
    )::NUMERIC as average_rating
  FROM vendors;
END;
$function$ LANGUAGE plpgsql;
