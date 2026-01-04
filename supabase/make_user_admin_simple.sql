-- Make User Admin (Simplified Version)
-- User ID: ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e
-- Email: boris.massesa@thefestaevents.com

-- ============================================
-- STEP 1: Ensure user exists in public.users and set role to admin
-- ============================================
INSERT INTO users (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
  'admin' as role
FROM auth.users
WHERE id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e'
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  name = COALESCE(EXCLUDED.name, users.name),
  email = EXCLUDED.email
RETURNING id, email, name, role;

-- ============================================
-- STEP 2: Update auth.users raw_app_meta_data to ensure role is admin
-- ============================================
UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
WHERE id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e'
RETURNING id, email, raw_app_meta_data->>'role' as role;

-- ============================================
-- STEP 3: Verify the user is now admin
-- ============================================
SELECT 
  pu.id,
  pu.email,
  pu.name,
  pu.role as public_role,
  au.raw_app_meta_data->>'role' as auth_role,
  CASE 
    WHEN pu.role = 'admin' AND au.raw_app_meta_data->>'role' = 'admin' 
    THEN '✅ User is admin in both tables'
    ELSE '❌ Role mismatch - check both tables'
  END as status
FROM users pu
JOIN auth.users au ON au.id = pu.id
WHERE pu.id = 'ebbe9f4d-b5aa-4e59-aa03-f0a8acdc265e';
