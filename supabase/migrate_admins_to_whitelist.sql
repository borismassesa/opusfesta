-- Migration script to populate admin_whitelist from existing users
-- Run this after creating the admin_whitelist table
-- 
-- This script:
-- 1. Finds all users with role = 'admin' (users table only has 'user', 'vendor', 'admin')
-- 2. Creates entries in admin_whitelist for them
-- 3. Links them to their user records
-- Note: The admin_whitelist table supports 'owner', 'admin', 'editor', 'viewer' roles
-- but the users.role enum only has 'admin'. You can manually set specific users to 'owner'
-- in the admin_whitelist table after running this script.

-- Insert admins from users table into admin_whitelist
-- Note: users table has 'name' column, not 'full_name'
INSERT INTO admin_whitelist (user_id, email, full_name, role, is_active, added_at)
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(u.name, split_part(u.email, '@', 1)) as full_name,
  'admin' as role,  -- Default to 'admin', can be changed to 'owner' manually if needed
  true as is_active,
  u.created_at as added_at
FROM users u
WHERE u.role = 'admin'::user_role  -- Only 'admin' exists in user_role enum
  AND u.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM admin_whitelist aw 
    WHERE aw.email = u.email
  )
ON CONFLICT (email) DO NOTHING;

-- Also try to get better name data from auth.users (which may have full_name in metadata)
UPDATE admin_whitelist aw
SET full_name = COALESCE(
  aw.full_name,
  (SELECT COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    -- Format email username as name (capitalize, replace dots with spaces)
    initcap(replace(replace(replace(split_part(au.email, '@', 1), '.', ' '), '_', ' '), '-', ' '))
  ) FROM auth.users au WHERE au.id = aw.user_id)
)
WHERE aw.full_name IS NULL OR aw.full_name = split_part(aw.email, '@', 1);

-- Format names that look like email usernames (contain dots/underscores)
UPDATE admin_whitelist
SET full_name = initcap(replace(replace(replace(full_name, '.', ' '), '_', ' '), '-', ' '))
WHERE full_name LIKE '%.%' OR full_name LIKE '%_%' OR full_name LIKE '%-%';

-- Show summary
SELECT 
  COUNT(*) as total_admins,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive
FROM admin_whitelist;
