-- Migration 008: Vendor Category Counts Function
-- This migration creates a function to get vendor counts grouped by category

-- Create function to get vendor counts by category
CREATE OR REPLACE FUNCTION get_vendor_category_counts()
RETURNS TABLE (
  category TEXT,
  count BIGINT
) AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    v.category::TEXT as category,
    COUNT(*)::BIGINT as count
  FROM vendors v
  WHERE v.verified = true
  GROUP BY v.category
  ORDER BY count DESC;
END;
$function$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_vendor_category_counts IS 'Get count of verified vendors grouped by category';
