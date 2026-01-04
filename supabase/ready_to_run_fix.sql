-- READY TO RUN: Fix Inquiries for Review Testing
-- Run these queries one by one, replacing values as needed

-- ============================================
-- STEP 1: Check for existing users
-- ============================================
SELECT id, email, name, role
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- STEP 2A: If you have a user, use it
-- ============================================
-- Copy the ID from step 1, then run this (replace USER_ID_HERE):
/*
UPDATE inquiries
SET 
  user_id = 'USER_ID_HERE',  -- Replace with actual user ID from step 1
  event_date = CURRENT_DATE - INTERVAL '7 days'
WHERE id IN (
  '2b89a589-462b-45dc-a679-3e4cd364513e',
  'ba0f7d62-5cdf-4018-ae62-81bf935a2156'
)
RETURNING id, vendor_id, user_id, status, event_date;
*/

-- ============================================
-- STEP 2B: OR get UUID from auth.users and insert
-- ============================================
-- First, run this to see available auth users:
/*
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
*/

-- Then use one of those UUIDs in this query (replace ACTUAL-UUID-HERE):
/*
INSERT INTO users (id, email, name, role, password)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
  'user' as role,
  encrypted_password as password
FROM auth.users
WHERE id = 'ACTUAL-UUID-HERE'  -- Replace with actual UUID from query above
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'user',
  name = COALESCE(EXCLUDED.name, users.name)
RETURNING id, email, name, role;
*/

-- Then use that ID in STEP 2A above

-- ============================================
-- STEP 3: Quick fix - Use one of your vendor users temporarily
-- ============================================
-- If you just want to test quickly, you can temporarily use a vendor user:
/*
UPDATE inquiries
SET 
  user_id = 'a0000001-0001-4001-8001-000000000001',  -- Sea Cliff Manager (or any vendor)
  event_date = CURRENT_DATE - INTERVAL '7 days'
WHERE id IN (
  '2b89a589-462b-45dc-a679-3e4cd364513e',
  'ba0f7d62-5cdf-4018-ae62-81bf935a2156'
)
RETURNING id, vendor_id, user_id, status, event_date;
*/

-- Note: You'll need to temporarily change that user's role to 'user' for testing:
/*
UPDATE users
SET role = 'user'
WHERE id = 'a0000001-0001-4001-8001-000000000001'
RETURNING id, email, name, role;
*/

-- ============================================
-- STEP 4: Verify the fix worked
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
