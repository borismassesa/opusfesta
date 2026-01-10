-- Setup Test Data for Review Moderation Testing
-- Run this after verifying your users exist

-- ============================================
-- 1. CREATE ADMIN USER
-- ============================================

-- Option A: Update an existing user to admin
-- Replace 'your-email@example.com' with an email you can access
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com'
RETURNING id, email, name, role;

-- Option B: Create a new admin user (if you have auth.users entry)
-- First, create the auth user via Supabase Auth UI or API
-- Then link it to the users table:
/*
INSERT INTO users (id, email, name, role, password)
VALUES (
  'admin-uuid-here',  -- Use the UUID from auth.users
  'admin@opusfesta.com',
  'Admin User',
  'admin',
  '$2a$10$hashedpassword'  -- Or use Supabase Auth
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';
*/

-- ============================================
-- 2. CREATE REGULAR USER (for submitting reviews)
-- ============================================

-- Option A: Update an existing user to regular user role
UPDATE users
SET role = 'user'
WHERE email = 'test@example.com'
RETURNING id, email, name, role;

-- Option B: Create a new test user
-- First create via Supabase Auth, then:
/*
INSERT INTO users (id, email, name, role, password)
VALUES (
  'test-user-uuid-here',
  'test@example.com',
  'Test User',
  'user',
  '$2a$10$hashedpassword'
)
ON CONFLICT (email) DO UPDATE SET role = 'user';
*/

-- ============================================
-- 3. GET TEST USER AND VENDOR IDs
-- ============================================

-- Get a test user (regular user, not vendor)
SELECT id, email, name, role
FROM users
WHERE role = 'user'
LIMIT 1;

-- Get a vendor to review
SELECT id, business_name, category
FROM vendors
LIMIT 1;

-- ============================================
-- 4. CREATE COMPLETED INQUIRY (required for review)
-- ============================================

-- Replace the UUIDs with actual values from step 3
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
  'b0000002-0002-4002-8002-000000000002',  -- Vendor ID (e.g., Bella Photography)
  'test-user-uuid-here',                    -- User ID from step 3
  'Test User',
  'test@example.com',
  'wedding',
  CURRENT_DATE - INTERVAL '7 days',  -- Event date in the past (required!)
  'accepted',  -- Must be 'accepted' or 'responded' for review eligibility
  'Test inquiry for review testing. This inquiry was completed successfully.'
)
RETURNING id, vendor_id, user_id, status, event_date, created_at;
*/

-- ============================================
-- 5. VERIFY SETUP
-- ============================================

-- Check admin user exists
SELECT id, email, name, role
FROM users
WHERE role = 'admin';

-- Check test user exists
SELECT id, email, name, role
FROM users
WHERE role = 'user';

-- Check completed inquiry exists
SELECT 
  i.id,
  i.vendor_id,
  v.business_name as vendor_name,
  i.user_id,
  u.email as user_email,
  i.status,
  i.event_date,
  CASE 
    WHEN i.status IN ('accepted', 'responded') AND i.event_date <= CURRENT_DATE 
    THEN 'Eligible for review'
    ELSE 'Not eligible'
  END as review_eligibility
FROM inquiries i
JOIN vendors v ON v.id = i.vendor_id
JOIN users u ON u.id = i.user_id
WHERE i.status IN ('accepted', 'responded')
  AND i.event_date <= CURRENT_DATE
ORDER BY i.created_at DESC
LIMIT 5;

-- ============================================
-- 6. QUICK SETUP (All in one - replace UUIDs)
-- ============================================

-- Step 1: Make one of your existing users an admin
UPDATE users
SET role = 'admin'
WHERE id = 'a0000001-0001-4001-8001-000000000001'  -- Sea Cliff Manager
RETURNING id, email, name, role;

-- Step 2: Create a test user (you'll need to create this via Supabase Auth first)
-- Then update the users table:
/*
UPDATE users
SET role = 'user'
WHERE email = 'test@example.com';
*/

-- Step 3: Create a completed inquiry
-- Use one of the vendor IDs you have and a test user ID
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
  CURRENT_DATE - INTERVAL '7 days',
  'accepted',
  'Test inquiry for review testing'
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'user')
RETURNING id, vendor_id, user_id, status, event_date;
*/
