-- Fix admin full_name in admin_whitelist
-- This script updates the full_name to proper format (capitalized, no dots)

-- Update Boris's name
UPDATE admin_whitelist
SET full_name = 'Boris Massesa'
WHERE email = 'boris.massesa@opusfestaevents.com';

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

-- Update all admin names that look like email usernames (contain dots/underscores)
UPDATE admin_whitelist
SET full_name = format_name_from_email(email)
WHERE full_name IS NULL 
   OR full_name = split_part(email, '@', 1)
   OR full_name LIKE '%.%'
   OR full_name LIKE '%_%';

-- Show updated results
SELECT email, full_name, role, is_active 
FROM admin_whitelist
ORDER BY created_at DESC;
