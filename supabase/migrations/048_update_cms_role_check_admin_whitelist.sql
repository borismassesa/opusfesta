-- Update cms_role() function to check admin_whitelist as fallback
-- This ensures ALL admins can publish homepage changes, even if their
-- app_metadata role isn't set correctly

CREATE OR REPLACE FUNCTION cms_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  jwt_role text;
  whitelist_role text;
  user_email text;
BEGIN
  -- First, try to get role from JWT app_metadata
  jwt_role := COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '');
  
  -- If we have a role from JWT, return it
  IF jwt_role != '' THEN
    RETURN jwt_role;
  END IF;
  
  -- Fallback: Check admin_whitelist table
  -- Try to get role from admin_whitelist using user_id first (more reliable)
  SELECT aw.role INTO whitelist_role
  FROM admin_whitelist aw
  WHERE aw.user_id = auth.uid()
    AND aw.is_active = true
    AND aw.role IN ('owner', 'admin', 'editor', 'viewer')
  LIMIT 1;
  
  -- If found by user_id, return it
  IF whitelist_role IS NOT NULL AND whitelist_role != '' THEN
    RETURN whitelist_role;
  END IF;
  
  -- Fallback to email check if user_id didn't match
  user_email := auth.email();
  
  -- If no email, return empty string
  IF user_email IS NULL OR user_email = '' THEN
    RETURN '';
  END IF;
  
  -- Check admin_whitelist for active admin/owner by email
  SELECT aw.role INTO whitelist_role
  FROM admin_whitelist aw
  WHERE LOWER(aw.email) = LOWER(user_email)
    AND aw.is_active = true
    AND aw.role IN ('owner', 'admin', 'editor', 'viewer')
  LIMIT 1;
  
  -- Return whitelist role if found, otherwise empty string
  RETURN COALESCE(whitelist_role, '');
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION cms_role() IS 'Returns user role from JWT app_metadata, or falls back to admin_whitelist table. Ensures all admins can publish homepage changes.';
