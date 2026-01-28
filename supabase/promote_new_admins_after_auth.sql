-- Run this AFTER you have created the auth users (with email + password).
-- Use either:
--   A) Admin portal: admin.opusfesta.com → Users → Add user (email, name, password, role Admin)
--   B) Supabase Dashboard: Authentication → Users → Add user (email + temp password, confirm email)
--
-- Then run this script in Supabase SQL Editor to:
--   1. Create/update public.users with role = admin
--   2. Set auth.users app_metadata.role = admin
--   3. Link admin_whitelist.user_id to the auth user
--
-- Emails: ibadatt.aulakh@opusfesta.com, boris.massesa@opusfesta.com

-- ============================================
-- 1. Ensure users row exists with role = admin (from auth.users by email)
-- ============================================
INSERT INTO users (id, email, name, role, password)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  'admin'::user_role,
  au.encrypted_password
FROM auth.users au
WHERE au.email IN ('ibadatt.aulakh@opusfesta.com', 'boris.massesa@opusfesta.com')
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin'::user_role,
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, users.name);

-- ============================================
-- 2. Set auth.users app_metadata role to admin
-- ============================================
UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
WHERE email IN ('ibadatt.aulakh@opusfesta.com', 'boris.massesa@opusfesta.com');

-- ============================================
-- 3. Link admin_whitelist to user_id
-- ============================================
UPDATE admin_whitelist aw
SET user_id = au.id
FROM auth.users au
WHERE aw.email = au.email
  AND aw.user_id IS NULL;

-- ============================================
-- 4. Verify
-- ============================================
SELECT 
  aw.email,
  aw.full_name,
  aw.role,
  aw.is_active,
  aw.user_id IS NOT NULL as has_user_record
FROM admin_whitelist aw
WHERE aw.email IN ('ibadatt.aulakh@opusfesta.com', 'boris.massesa@opusfesta.com')
ORDER BY aw.email;
