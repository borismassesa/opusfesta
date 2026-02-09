-- Migration 053: Update cms_role() function for Clerk JWTs
-- Clerk stores public metadata under 'metadata' key in JWT
-- Clerk includes email directly in JWT claims as 'email'

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
  -- First, try to get role from Clerk JWT metadata (public metadata)
  jwt_role := COALESCE(auth.jwt() -> 'metadata' ->> 'role', '');

  -- If we have a role from JWT, return it
  IF jwt_role != '' THEN
    RETURN jwt_role;
  END IF;

  -- Fallback: Check admin_whitelist table using requesting_user_id()
  SELECT aw.role INTO whitelist_role
  FROM admin_whitelist aw
  WHERE aw.user_id = requesting_user_id()
    AND aw.is_active = true
    AND aw.role IN ('owner', 'admin', 'editor', 'viewer')
  LIMIT 1;

  -- If found by user_id, return it
  IF whitelist_role IS NOT NULL AND whitelist_role != '' THEN
    RETURN whitelist_role;
  END IF;

  -- Fallback to email check (Clerk includes email in JWT)
  user_email := auth.jwt() ->> 'email';

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

COMMENT ON FUNCTION cms_role() IS 'Returns user role from Clerk JWT metadata, or falls back to admin_whitelist table. Compatible with Clerk third-party auth.';
