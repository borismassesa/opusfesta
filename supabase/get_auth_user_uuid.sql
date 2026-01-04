-- Get UUIDs from auth.users table
-- Run this first to get a UUID to use

-- ============================================
-- OPTION 1: Get UUIDs from auth.users
-- ============================================
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- OPTION 2: Check if auth user already exists in public.users
-- ============================================
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  pu.id as public_user_id,
  pu.role as public_role,
  CASE 
    WHEN pu.id IS NULL THEN '❌ Not in public.users - needs to be added'
    ELSE '✅ Already in public.users'
  END as status
FROM auth.users au
LEFT JOIN users pu ON pu.id = au.id
ORDER BY au.created_at DESC
LIMIT 10;

-- ============================================
-- OPTION 3: Insert user from auth.users to public.users
-- ============================================
-- Replace 'ACTUAL-UUID-HERE' with a UUID from OPTION 1 above
-- Replace 'actual-email@example.com' with the email from OPTION 1
/*
INSERT INTO users (id, email, name, role, password)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
  'user' as role,
  encrypted_password as password
FROM auth.users
WHERE id = 'ACTUAL-UUID-HERE'  -- Replace with actual UUID
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'user',
  name = COALESCE(EXCLUDED.name, users.name)
RETURNING id, email, name, role;
*/

-- ============================================
-- OPTION 4: Quick fix - Use existing user and just update role
-- ============================================
-- If you already have users in public.users, just update one:
/*
UPDATE users
SET role = 'user'
WHERE id = 'a0000001-0001-4001-8001-000000000001'  -- Use any existing user ID
RETURNING id, email, name, role;
*/
