-- Quick Test Setup for Review Moderation
-- Run these queries in order to set up test data

-- ============================================
-- STEP 1: Create Admin User
-- ============================================
-- Update one of your existing users to admin role
UPDATE users
SET role = 'admin'
WHERE id = 'a0000001-0001-4001-8001-000000000001'  -- Sea Cliff Manager
RETURNING id, email, name, role;

-- Verify admin was created
SELECT id, email, name, role
FROM users
WHERE role = 'admin';

-- ============================================
-- STEP 2: Create Test User (Regular User)
-- ============================================
-- You need to create this user via Supabase Auth first, then run:
-- (Replace with actual auth user UUID after creating via Supabase Auth UI)

-- Option: If you already have a user in auth.users, link it:
/*
INSERT INTO users (id, email, name, role, password)
VALUES (
  'test-user-uuid-from-auth',  -- Get this from auth.users table
  'test@example.com',
  'Test User',
  'user',
  '$2a$10$placeholder'  -- Password handled by Supabase Auth
)
ON CONFLICT (email) DO UPDATE 
SET role = 'user', name = 'Test User';
*/

-- Or update an existing user to be a regular user:
-- (If you have a user that's not a vendor)

-- ============================================
-- STEP 3: Get Vendor ID for Testing
-- ============================================
SELECT id, business_name, category
FROM vendors
WHERE id = 'b0000002-0002-4002-8002-000000000002'  -- Bella Photography
LIMIT 1;

-- ============================================
-- STEP 4: Create Completed Inquiry
-- ============================================
-- This allows the test user to submit a review
-- Replace 'test-user-uuid-here' with actual user ID from step 2

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
VALUES (
  'b0000002-0002-4002-8002-000000000002',  -- Bella Photography
  'test-user-uuid-here',                    -- Replace with test user ID
  'Test User',
  'test@example.com',
  'wedding',
  CURRENT_DATE - INTERVAL '7 days',  -- Event in the past (required!)
  'accepted',  -- Must be 'accepted' or 'responded'
  'Test inquiry for review testing. This inquiry was completed successfully.'
)
RETURNING id, vendor_id, user_id, status, event_date;
*/

-- ============================================
-- STEP 5: Verify Setup
-- ============================================

-- Check admin exists
SELECT 
  'Admin User' as check_type, 
  id::text as id, 
  email, 
  name, 
  role::text as role
FROM users
WHERE role = 'admin'
UNION ALL
-- Check test user exists
SELECT 
  'Test User' as check_type, 
  id::text as id, 
  email, 
  name, 
  role::text as role
FROM users
WHERE role = 'user'
UNION ALL
-- Check inquiry exists (if created)
SELECT 
  'Inquiry' as check_type, 
  i.id::text as id, 
  u.email, 
  v.business_name as name, 
  i.status::text as role
FROM inquiries i
JOIN users u ON u.id = i.user_id
JOIN vendors v ON v.id = i.vendor_id
WHERE i.status IN ('accepted', 'responded')
  AND i.event_date <= CURRENT_DATE
LIMIT 1;

-- ============================================
-- ALTERNATIVE: Use Existing Data
-- ============================================
-- If you already have inquiries in your database, check them:

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
    ELSE '❌ Not eligible (status: ' || i.status || ', date: ' || i.event_date || ')'
  END as review_eligibility
FROM inquiries i
JOIN vendors v ON v.id = i.vendor_id
LEFT JOIN users u ON u.id = i.user_id
ORDER BY i.created_at DESC
LIMIT 10;
