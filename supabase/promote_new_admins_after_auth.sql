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
-- Email source: a single temp table (promote_emails) populated from admin_whitelist
-- so all three steps use the same set. No hardcoded emails. On any error, run ROLLBACK;

BEGIN;

-- ============================================
-- Email set: one source for all steps
-- Default: active admin_whitelist entries.
-- For ad-hoc: replace the INSERT below with e.g.
--   INSERT INTO promote_emails (email) VALUES
--     ('one@example.com'),
--     ('two@example.com');
-- ============================================
CREATE TEMP TABLE promote_emails (email text);

INSERT INTO promote_emails (email)
SELECT email FROM admin_whitelist WHERE is_active = true;

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
WHERE au.email IN (SELECT email FROM promote_emails)
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
WHERE email IN (SELECT email FROM promote_emails);

-- ============================================
-- 3. Link admin_whitelist to user_id (only for promote set, unlinked rows)
-- ============================================
UPDATE admin_whitelist aw
SET user_id = au.id
FROM auth.users au
WHERE aw.email = au.email
  AND aw.user_id IS NULL
  AND aw.email IN (SELECT email FROM promote_emails);

-- ============================================
-- 4. Verify (inside transaction; roll back if something looks wrong)
-- ============================================
SELECT 
  aw.email,
  aw.full_name,
  aw.role,
  aw.is_active,
  aw.user_id IS NOT NULL AS has_user_record
FROM admin_whitelist aw
WHERE aw.email IN (SELECT email FROM promote_emails)
ORDER BY aw.email;

COMMIT;
-- If any statement above failed, run: ROLLBACK;
