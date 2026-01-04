-- Verify that the review policy fix was applied correctly

-- ============================================
-- 1. Check if the helper function exists
-- ============================================
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_name = 'check_no_duplicate_review'
AND routine_schema = 'public';

-- ============================================
-- 2. Check the policy definition
-- ============================================
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'reviews'
AND policyname = 'Authenticated users can create reviews';

-- ============================================
-- 3. Test the helper function (if you have test data)
-- ============================================
-- This should return true if no duplicate exists, false if one exists
/*
SELECT check_no_duplicate_review(
  'user-uuid-here'::UUID,
  'vendor-uuid-here'::UUID
) as can_create_review;
*/

-- ============================================
-- 4. Verify the policy is using the function
-- ============================================
-- The with_check expression should contain 'check_no_duplicate_review'
SELECT 
  policyname,
  with_check
FROM pg_policies
WHERE tablename = 'reviews'
AND policyname = 'Authenticated users can create reviews'
AND with_check LIKE '%check_no_duplicate_review%';
