-- Make User Admin + Studio Admin Access Fallback
-- Target email: bmmassesa@gmail.com
--
-- This script:
-- 1) Sets public.users.role = 'admin' for the target email
-- 2) If missing in public.users but present in auth.users, inserts user row as admin
-- 3) Updates auth.users raw_app_meta_data.role = 'admin' (when auth row exists)
-- 4) Verifies final status
--
-- Note:
-- Studio admin in app code now accepts public.users.role='admin' as fallback,
-- mapping it to studio_admin access.

-- ============================================
-- STEP 1: Promote existing public.users row by email
-- ============================================
UPDATE users
SET role = 'admin'
WHERE lower(email) = lower('bmmassesa@gmail.com')
RETURNING id, email, name, role;

-- ============================================
-- STEP 2: Insert from auth.users if user is missing in public.users
-- ============================================
INSERT INTO users (id, email, name, role, password)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) AS name,
  'admin' AS role,
  au.encrypted_password AS password
FROM auth.users au
WHERE lower(au.email) = lower('bmmassesa@gmail.com')
  AND NOT EXISTS (
    SELECT 1
    FROM users u
    WHERE lower(u.email) = lower(au.email)
  )
RETURNING id, email, name, role;

-- Ensure role is admin after potential insert
UPDATE users
SET role = 'admin'
WHERE lower(email) = lower('bmmassesa@gmail.com')
RETURNING id, email, name, role;

-- ============================================
-- STEP 3: Update auth.users raw_app_meta_data.role = admin (if auth row exists)
-- ============================================
UPDATE auth.users
SET
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
WHERE lower(email) = lower('bmmassesa@gmail.com')
RETURNING id, email, raw_app_meta_data->>'role' as role;

-- ============================================
-- STEP 4: Verify final status + studio fallback expectation
-- ============================================
SELECT 
  pu.id,
  pu.email,
  pu.clerk_id,
  pu.name,
  pu.role as public_role,
  au.raw_app_meta_data->>'role' as auth_role,
  CASE 
    WHEN pu.role = 'admin' THEN '✅ public.users admin (studio fallback allows access)'
    ELSE '❌ public.users not admin'
  END as status
FROM users pu
LEFT JOIN auth.users au ON lower(au.email) = lower(pu.email)
WHERE lower(pu.email) = lower('bmmassesa@gmail.com');
