-- Update Inquiries to Use Your User ID
-- This will make the inquiries eligible for review testing

-- ============================================
-- STEP 1: Update inquiries to use your user_id
-- ============================================
UPDATE inquiries
SET 
  user_id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e',  -- Your user ID
  event_date = CURRENT_DATE - INTERVAL '7 days'  -- Ensure past date
WHERE id IN (
  '2b89a589-462b-45dc-a679-3e4cd364513e',
  'ba0f7d62-5cdf-4018-ae62-81bf935a2156'
)
RETURNING 
  id,
  vendor_id,
  user_id,
  status,
  event_date;

-- ============================================
-- STEP 2: Verify eligibility
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
      AND u.role = 'user'
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
-- STEP 3: Test the can_user_review_vendor function
-- ============================================
-- This should return true if everything is set up correctly:
SELECT can_user_review_vendor(
  'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e'::UUID,  -- Your user ID
  'b0000002-0002-4002-8002-000000000002'::UUID   -- Vendor ID (Bella Photography)
) as can_review;

-- Expected result: true
