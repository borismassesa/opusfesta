-- Verify Inquiry Eligibility for Reviews
-- Run this to check if everything is set up correctly

-- ============================================
-- Check inquiry eligibility
-- ============================================
SELECT 
  i.id as inquiry_id,
  i.vendor_id,
  v.business_name as vendor_name,
  i.user_id,
  u.email as user_email,
  u.name as user_name,
  u.role as user_role,
  i.status,
  i.event_date,
  CURRENT_DATE as today,
  CASE 
    WHEN i.status IN ('accepted', 'responded') 
      AND i.event_date <= CURRENT_DATE
      AND i.user_id IS NOT NULL
      AND u.role = 'user'  -- User must have 'user' role, not 'vendor'
    THEN '✅ Eligible for review'
    WHEN i.user_id IS NULL
    THEN '❌ Not eligible (guest inquiry - no user_id)'
    WHEN i.event_date > CURRENT_DATE
    THEN '❌ Not eligible (event date in future: ' || i.event_date || ')'
    WHEN u.role != 'user'
    THEN '❌ Not eligible (user role is "' || u.role || '", needs to be "user")'
    ELSE '❌ Not eligible (status: ' || i.status || ')'
  END as review_eligibility
FROM inquiries i
JOIN vendors v ON v.id = i.vendor_id
LEFT JOIN users u ON u.id = i.user_id
WHERE i.id IN (
  '2b89a589-462b-45dc-a679-3e4cd364513e',
  'ba0f7d62-5cdf-4018-ae62-81bf935a2156'
)
ORDER BY i.created_at DESC;

-- ============================================
-- Check user role
-- ============================================
SELECT 
  id,
  email,
  name,
  role,
  CASE 
    WHEN role = 'user' THEN '✅ Correct role for review testing'
    ELSE '⚠️  Role is "' || role || '" - needs to be "user" for review testing'
  END as role_status
FROM users
WHERE id = 'a0000001-0001-4001-8001-000000000001';

-- ============================================
-- Fix user role if needed
-- ============================================
-- If the user role is 'vendor', temporarily change it to 'user' for testing:
/*
UPDATE users
SET role = 'user'
WHERE id = 'a0000001-0001-4001-8001-000000000001'
RETURNING id, email, name, role;
*/

-- ============================================
-- Test the can_user_review_vendor function
-- ============================================
-- This should return true if everything is set up correctly:
/*
SELECT can_user_review_vendor(
  'a0000001-0001-4001-8001-000000000001'::UUID,  -- User ID
  'b0000002-0002-4002-8002-000000000002'::UUID   -- Vendor ID (Bella Photography)
) as can_review;
*/
