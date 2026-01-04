-- Create Test User and Fix Inquiries for Review Testing
-- Run these queries in order

-- ============================================
-- STEP 1: Check if you have any regular users
-- ============================================
SELECT id, email, name, role
FROM users
WHERE role = 'user'
LIMIT 5;

-- ============================================
-- STEP 2: Create a test user (if needed)
-- ============================================
-- Option A: If you have a user in auth.users but not in public.users:
-- (Get the UUID from Supabase Auth Dashboard → Authentication → Users)
/*
INSERT INTO users (id, email, name, role, password)
VALUES (
  'your-auth-user-uuid-here',  -- Get from auth.users table
  'test@example.com',
  'Test User',
  'user',
  '$2a$10$placeholder'  -- Password is handled by Supabase Auth
)
ON CONFLICT (email) DO UPDATE 
SET role = 'user', name = 'Test User';
*/

-- Option B: Update an existing user to be a regular user
-- (If you have a user that's currently a vendor or admin, you can temporarily change it)
/*
UPDATE users
SET role = 'user'
WHERE email = 'some-existing-email@example.com'
RETURNING id, email, name, role;
*/

-- ============================================
-- STEP 3: Get the test user ID
-- ============================================
-- Run this after step 2 to get the user ID you'll use:
SELECT id, email, name, role
FROM users
WHERE role = 'user'
LIMIT 1;

-- ============================================
-- STEP 4: Update inquiries with user_id and past date
-- ============================================
-- Replace 'YOUR-USER-ID-HERE' with the ID from step 3
/*
UPDATE inquiries
SET 
  user_id = 'YOUR-USER-ID-HERE',  -- Replace with actual user ID from step 3
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
    WHEN status IN ('accepted', 'responded') 
      AND event_date <= CURRENT_DATE
      AND user_id IS NOT NULL
    THEN '✅ Eligible for review'
    ELSE '❌ Not eligible'
  END as review_eligibility;
*/

-- ============================================
-- STEP 5: Verify the fix
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

-- ============================================
-- ALTERNATIVE: Create a new inquiry from scratch
-- ============================================
-- If you prefer to create a fresh inquiry instead of updating existing ones:
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
