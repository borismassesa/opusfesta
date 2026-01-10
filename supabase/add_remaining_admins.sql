-- Add remaining admins to the whitelist
-- These admins are in the env var but not yet in the database whitelist

-- Function to format name from email (capitalize and replace dots/underscores with spaces)
CREATE OR REPLACE FUNCTION format_name_from_email(email_address TEXT)
RETURNS TEXT AS $$
DECLARE
  local_part TEXT;
  formatted_name TEXT;
BEGIN
  -- Extract local part (before @)
  local_part := split_part(email_address, '@', 1);
  
  -- Replace dots, underscores, and hyphens with spaces
  formatted_name := replace(replace(replace(local_part, '.', ' '), '_', ' '), '-', ' ');
  
  -- Capitalize first letter of each word
  formatted_name := initcap(formatted_name);
  
  RETURN formatted_name;
END;
$$ LANGUAGE plpgsql;

-- Add Norah Kinunda
INSERT INTO admin_whitelist (user_id, email, full_name, role, is_active, added_at)
SELECT 
  u.id as user_id,
  'norah.kinunda@opusfestaevents.com' as email,
  COALESCE(
    u.name,
    format_name_from_email('norah.kinunda@opusfestaevents.com'),
    (SELECT COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      format_name_from_email('norah.kinunda@opusfestaevents.com')
    ) FROM auth.users au WHERE au.email = 'norah.kinunda@opusfestaevents.com' LIMIT 1)
  ) as full_name,
  'admin' as role,
  true as is_active,
  COALESCE(u.created_at, CURRENT_TIMESTAMP) as added_at
FROM users u
WHERE u.email = 'norah.kinunda@opusfestaevents.com'
ON CONFLICT (email) DO UPDATE
SET 
  full_name = COALESCE(EXCLUDED.full_name, admin_whitelist.full_name),
  is_active = true,
  role = COALESCE(admin_whitelist.role, 'admin');

-- Add Peace Msechu
INSERT INTO admin_whitelist (user_id, email, full_name, role, is_active, added_at)
SELECT 
  u.id as user_id,
  'peace.msechu@opusfestaevents.com' as email,
  COALESCE(
    u.name,
    format_name_from_email('peace.msechu@opusfestaevents.com'),
    (SELECT COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      format_name_from_email('peace.msechu@opusfestaevents.com')
    ) FROM auth.users au WHERE au.email = 'peace.msechu@opusfestaevents.com' LIMIT 1)
  ) as full_name,
  'admin' as role,
  true as is_active,
  COALESCE(u.created_at, CURRENT_TIMESTAMP) as added_at
FROM users u
WHERE u.email = 'peace.msechu@opusfestaevents.com'
ON CONFLICT (email) DO UPDATE
SET 
  full_name = COALESCE(EXCLUDED.full_name, admin_whitelist.full_name),
  is_active = true,
  role = COALESCE(admin_whitelist.role, 'admin');

-- If users don't exist in users table, create entries anyway (they might exist only in auth.users)
INSERT INTO admin_whitelist (email, full_name, role, is_active, added_at)
SELECT 
  'norah.kinunda@opusfestaevents.com' as email,
  COALESCE(
    (SELECT COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      format_name_from_email('norah.kinunda@opusfestaevents.com')
    ) FROM auth.users au WHERE au.email = 'norah.kinunda@opusfestaevents.com' LIMIT 1),
    format_name_from_email('norah.kinunda@opusfestaevents.com')
  ) as full_name,
  'admin' as role,
  true as is_active,
  COALESCE(
    (SELECT created_at FROM auth.users WHERE email = 'norah.kinunda@opusfestaevents.com' LIMIT 1),
    CURRENT_TIMESTAMP
  ) as added_at
WHERE NOT EXISTS (
  SELECT 1 FROM admin_whitelist WHERE email = 'norah.kinunda@opusfestaevents.com'
);

INSERT INTO admin_whitelist (email, full_name, role, is_active, added_at)
SELECT 
  'peace.msechu@opusfestaevents.com' as email,
  COALESCE(
    (SELECT COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      format_name_from_email('peace.msechu@opusfestaevents.com')
    ) FROM auth.users au WHERE au.email = 'peace.msechu@opusfestaevents.com' LIMIT 1),
    format_name_from_email('peace.msechu@opusfestaevents.com')
  ) as full_name,
  'admin' as role,
  true as is_active,
  COALESCE(
    (SELECT created_at FROM auth.users WHERE email = 'peace.msechu@opusfestaevents.com' LIMIT 1),
    CURRENT_TIMESTAMP
  ) as added_at
WHERE NOT EXISTS (
  SELECT 1 FROM admin_whitelist WHERE email = 'peace.msechu@opusfestaevents.com'
);

-- Update user_id for entries that were created without it
UPDATE admin_whitelist aw
SET user_id = au.id
FROM auth.users au
WHERE aw.email = au.email
  AND aw.user_id IS NULL;

-- Show updated results
SELECT 
  email,
  full_name,
  role,
  is_active,
  user_id IS NOT NULL as has_user_record
FROM admin_whitelist
ORDER BY created_at DESC;

-- Show summary
SELECT 
  COUNT(*) as total_admins,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive
FROM admin_whitelist;
