-- Add new admins to admin.opusfesta.com
-- Emails: ibadatt.aulakh@opusfesta.com, boris.massesa@opusfesta.com
--
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor).
--
-- PASSWORD / LOGIN: These users need Auth accounts (email + password) before they can log in.
-- Option A – You have one admin who can log in:
--   1. Log in to admin.opusfesta.com as that admin.
--   2. Go to Users → Add user. Create each person: email, full name, password, role Admin.
--   3. Run supabase/promote_new_admins_after_auth.sql in SQL Editor (links whitelist to user_id).
-- Option B – No one can log in yet:
--   1. Supabase Dashboard → Authentication → Users → Add user.
--      Add each email with a temporary password; check "Auto Confirm User".
--   2. Run supabase/promote_new_admins_after_auth.sql in SQL Editor.
--   3. Share the temporary passwords; they can change via Forgot password after first login.

-- ============================================
-- Helper: format name from email (capitalize, replace dots/underscores with spaces)
-- ============================================
CREATE OR REPLACE FUNCTION format_name_from_email(email_address TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN initcap(
    replace(replace(replace(split_part(email_address, '@', 1), '.', ' '), '_', ' '), '-', ' ')
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. Add to admin_whitelist (with user_id if they already exist in users)
-- ============================================

-- ibadatt.aulakh@opusfesta.com
INSERT INTO admin_whitelist (user_id, email, full_name, role, is_active, added_at)
SELECT 
  u.id as user_id,
  'ibadatt.aulakh@opusfesta.com' as email,
  COALESCE(
    u.name,
    format_name_from_email('ibadatt.aulakh@opusfesta.com'),
    (SELECT COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      format_name_from_email('ibadatt.aulakh@opusfesta.com')
    ) FROM auth.users au WHERE au.email = 'ibadatt.aulakh@opusfesta.com' LIMIT 1)
  ) as full_name,
  'admin' as role,
  true as is_active,
  COALESCE(u.created_at, CURRENT_TIMESTAMP) as added_at
FROM users u
WHERE u.email = 'ibadatt.aulakh@opusfesta.com'
ON CONFLICT (email) DO UPDATE
SET 
  full_name = COALESCE(EXCLUDED.full_name, admin_whitelist.full_name),
  user_id = COALESCE(EXCLUDED.user_id, admin_whitelist.user_id),
  is_active = true,
  role = COALESCE(admin_whitelist.role, 'admin');

-- If not in users yet, add whitelist entry without user_id (link user_id after they sign up)
INSERT INTO admin_whitelist (email, full_name, role, is_active, added_at)
SELECT 
  'ibadatt.aulakh@opusfesta.com' as email,
  COALESCE(
    (SELECT COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      format_name_from_email('ibadatt.aulakh@opusfesta.com')
    ) FROM auth.users au WHERE au.email = 'ibadatt.aulakh@opusfesta.com' LIMIT 1),
    format_name_from_email('ibadatt.aulakh@opusfesta.com')
  ) as full_name,
  'admin' as role,
  true as is_active,
  COALESCE(
    (SELECT created_at FROM auth.users WHERE email = 'ibadatt.aulakh@opusfesta.com' LIMIT 1),
    CURRENT_TIMESTAMP
  ) as added_at
WHERE NOT EXISTS (
  SELECT 1 FROM admin_whitelist WHERE email = 'ibadatt.aulakh@opusfesta.com'
);

-- boris.massesa@opusfesta.com
INSERT INTO admin_whitelist (user_id, email, full_name, role, is_active, added_at)
SELECT 
  u.id as user_id,
  'boris.massesa@opusfesta.com' as email,
  COALESCE(
    u.name,
    format_name_from_email('boris.massesa@opusfesta.com'),
    (SELECT COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      format_name_from_email('boris.massesa@opusfesta.com')
    ) FROM auth.users au WHERE au.email = 'boris.massesa@opusfesta.com' LIMIT 1)
  ) as full_name,
  'admin' as role,
  true as is_active,
  COALESCE(u.created_at, CURRENT_TIMESTAMP) as added_at
FROM users u
WHERE u.email = 'boris.massesa@opusfesta.com'
ON CONFLICT (email) DO UPDATE
SET 
  full_name = COALESCE(EXCLUDED.full_name, admin_whitelist.full_name),
  user_id = COALESCE(EXCLUDED.user_id, admin_whitelist.user_id),
  is_active = true,
  role = COALESCE(admin_whitelist.role, 'admin');

INSERT INTO admin_whitelist (email, full_name, role, is_active, added_at)
SELECT 
  'boris.massesa@opusfesta.com' as email,
  COALESCE(
    (SELECT COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      format_name_from_email('boris.massesa@opusfesta.com')
    ) FROM auth.users au WHERE au.email = 'boris.massesa@opusfesta.com' LIMIT 1),
    format_name_from_email('boris.massesa@opusfesta.com')
  ) as full_name,
  'admin' as role,
  true as is_active,
  COALESCE(
    (SELECT created_at FROM auth.users WHERE email = 'boris.massesa@opusfesta.com' LIMIT 1),
    CURRENT_TIMESTAMP
  ) as added_at
WHERE NOT EXISTS (
  SELECT 1 FROM admin_whitelist WHERE email = 'boris.massesa@opusfesta.com'
);

-- ============================================
-- 2. Promote existing users to admin (users table + auth.users)
-- So API routes recognize them as admin.
-- ============================================

-- Ensure users row exists with role = admin (from auth.users by email)
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

-- Set auth.users app_metadata role to admin
UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
WHERE email IN ('ibadatt.aulakh@opusfesta.com', 'boris.massesa@opusfesta.com');

-- ============================================
-- 3. Link whitelist entries to user_id if they were created without it
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
  email,
  full_name,
  role,
  is_active,
  user_id IS NOT NULL as has_user_record
FROM admin_whitelist
WHERE email IN ('ibadatt.aulakh@opusfesta.com', 'boris.massesa@opusfesta.com')
ORDER BY email;
