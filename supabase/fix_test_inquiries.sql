-- Fix Test Inquiries for Review Testing
-- This script updates inquiries to be eligible for reviews

-- ============================================
-- OPTION 1: Update existing inquiries to be eligible
-- ============================================

-- Step 1: Get or create a test user (regular user, not vendor)
-- First, check if you have any regular users:
SELECT id, email, name, role
FROM users
WHERE role = 'user'
LIMIT 1;

-- If you don't have a regular user, you'll need to create one via Supabase Auth
-- Then update the users table:
/*
UPDATE users
SET role = 'user'
WHERE email = 'test@example.com';
*/

-- Step 2: Update inquiries to have a user_id and past event date
-- Replace 'test-user-uuid-here' with an actual user ID from step 1
/*
UPDATE inquiries
SET 
  user_id = 'test-user-uuid-here',  -- Replace with actual user ID
  event_date = CURRENT_DATE - INTERVAL '7 days'  -- Set to past date
WHERE id IN (
  '2b89a589-462b-45dc-a679-3e4cd364513e',
  'ba0f7d62-5cdf-4018-ae62-81bf935a2156'
)
RETURNING 
  id,
  vendor_id,
  user_id,
  status,
  event_date,
  CASE 
    WHEN status IN ('accepted', 'responded') AND event_date <= CURRENT_DATE 
    THEN '✅ Eligible for review'
    ELSE '❌ Not eligible'
  END as review_eligibility;
*/

-- ============================================
-- OPTION 2: Create new test inquiry with proper setup
-- ============================================

-- This creates a properly configured inquiry for testing
/*
INSERT INTO inquiries (
  vendor_id,
  user_id,
  name,
  email,
  event_type,
  event_date,
  status,
  message
)
SELECT 
  'b0000002-0002-4002-8002-000000000002',  -- Bella Photography
  (SELECT id FROM users WHERE role = 'user' LIMIT 1),  -- First regular user
  'Test User',
  (SELECT email FROM users WHERE role = 'user' LIMIT 1),
  'wedding',
  CURRENT_DATE - INTERVAL '7 days',  -- Event in the past
  'accepted',  -- Accepted status
  'Test inquiry for review testing. This inquiry was completed successfully.'
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'user')
RETURNING 
  id,
  vendor_id,
  user_id,
  status,
  event_date,
  '✅ Eligible for review' as review_eligibility;
*/

-- ============================================
-- OPTION 3: Quick fix - Just update event dates to past
-- ============================================

-- If you just want to test with guest inquiries (though they won't be able to submit reviews),
-- you can update the dates:
/*
UPDATE inquiries
SET event_date = CURRENT_DATE - INTERVAL '7 days'
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
*/

-- ============================================
-- VERIFY: Check eligibility after updates
-- ============================================

SELECT 
  i.id as inquiry_id,
  i.vendor_id,
  v.business_name as vendor_name,
  i.user_id,
  u.email as user_email,
  u.role as user_role,
  i.status,
  i.event_date,
  CASE 
    WHEN i.status IN ('accepted', 'responded') 
      AND i.event_date <= CURRENT_DATE
      AND i.user_id IS NOT NULL
    THEN '✅ Eligible for review'
    WHEN i.user_id IS NULL
    THEN '❌ Not eligible (guest inquiry - no user_id)'
    WHEN i.event_date > CURRENT_DATE
    THEN '❌ Not eligible (event date in future: ' || i.event_date || ')'
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
