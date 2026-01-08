-- Fix existing auth.users that don't have records in public.users
-- This script creates user records in public.users for users that exist in auth.users
-- but don't have corresponding records in public.users
--
-- IMPORTANT: This script must be run with service role permissions or as a superuser
-- to bypass RLS policies. Run it in Supabase Dashboard → SQL Editor with service role key
-- OR temporarily disable RLS, run the script, then re-enable RLS

-- Insert users from auth.users into public.users if they don't already exist
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  '$2a$10$placeholder_password_not_used_with_supabase_auth' as password,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ) as name,
  CASE 
    WHEN au.raw_user_meta_data->>'user_type' = 'vendor' THEN 'vendor'::user_role
    WHEN au.raw_user_meta_data->>'user_type' = 'admin' THEN 'admin'::user_role
    ELSE 'user'::user_role
  END as role,
  au.created_at,
  COALESCE(au.updated_at, au.created_at) as updated_at
FROM auth.users au
LEFT JOIN users pu ON pu.id = au.id
WHERE pu.id IS NULL  -- Only insert if user doesn't exist in public.users
  AND au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Show summary of what was created
SELECT 
  COUNT(*) as users_created,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as couples,
  COUNT(CASE WHEN role = 'vendor' THEN 1 END) as vendors,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM users
WHERE id IN (
  SELECT id FROM auth.users
);
