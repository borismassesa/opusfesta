-- Fix RLS Policy for Review Creation
-- The duplicate check in the WITH CHECK clause had a bug where PostgreSQL was resolving
-- vendor_id to the subquery table instead of the NEW row being inserted.
-- We need to use a function or restructure to properly reference the NEW row's vendor_id.

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;

-- Create a helper function to check for duplicate reviews
-- This avoids the scoping issue in WITH CHECK clauses
CREATE OR REPLACE FUNCTION check_no_duplicate_review(
  p_user_id UUID,
  p_vendor_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM reviews
    WHERE user_id = p_user_id
      AND vendor_id = p_vendor_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Recreate the policy using the helper function
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND can_user_review_vendor(auth.uid(), vendor_id)
    AND check_no_duplicate_review(auth.uid(), vendor_id)
  );
