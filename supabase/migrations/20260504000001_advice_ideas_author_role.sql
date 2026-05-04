-- Advice & Ideas author role
-- Lets owners assign article writers through admin_whitelist without making
-- those users full editors of the rest of the CMS.

DO $$
DECLARE
  role_constraint text;
BEGIN
  IF to_regclass('public.admin_whitelist') IS NULL THEN
    RAISE EXCEPTION 'admin_whitelist table is missing — apply migration 040_create_admin_whitelist.sql first';
  END IF;

  SELECT conname INTO role_constraint
  FROM pg_constraint
  WHERE conrelid = 'public.admin_whitelist'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%role%'
    AND pg_get_constraintdef(oid) ILIKE '%owner%'
  LIMIT 1;

  IF role_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE admin_whitelist DROP CONSTRAINT %I', role_constraint);
  END IF;

  ALTER TABLE admin_whitelist
    ADD CONSTRAINT admin_whitelist_role_check
    CHECK (role IN ('owner', 'admin', 'editor', 'author', 'viewer'));
END $$;

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
  jwt_role := COALESCE(
    auth.jwt() -> 'metadata' ->> 'role',
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() ->> 'role',
    ''
  );

  IF jwt_role IN ('owner', 'admin', 'editor', 'author', 'viewer') THEN
    RETURN jwt_role;
  END IF;

  SELECT aw.role INTO whitelist_role
  FROM admin_whitelist aw
  WHERE aw.user_id = requesting_user_id()
    AND aw.is_active = true
    AND aw.role IN ('owner', 'admin', 'editor', 'author', 'viewer')
  LIMIT 1;

  IF whitelist_role IS NOT NULL AND whitelist_role != '' THEN
    RETURN whitelist_role;
  END IF;

  user_email := auth.jwt() ->> 'email';
  IF user_email IS NULL OR user_email = '' THEN
    RETURN '';
  END IF;

  SELECT aw.role INTO whitelist_role
  FROM admin_whitelist aw
  WHERE LOWER(aw.email) = LOWER(user_email)
    AND aw.is_active = true
    AND aw.role IN ('owner', 'admin', 'editor', 'author', 'viewer')
  LIMIT 1;

  RETURN COALESCE(whitelist_role, '');
END;
$$;

COMMENT ON COLUMN admin_whitelist.role IS 'Admin role: owner, admin, editor, author, or viewer';
COMMENT ON FUNCTION cms_role() IS 'Returns admin role from Clerk JWT metadata, app metadata, or active admin_whitelist entry.';

DROP POLICY IF EXISTS "staff write advice ideas posts" ON advice_ideas_posts;
CREATE POLICY "staff write advice ideas posts" ON advice_ideas_posts
  FOR ALL TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor', 'author'))
  WITH CHECK (cms_role() IN ('owner', 'admin', 'editor', 'author'));
