-- Grant 'author' role to advice & ideas writers. Authors can create / edit /
-- publish articles but have no access to the rest of the CMS.
-- Run in Supabase SQL Editor (project: ppdapuqehwlfwofbpbvb).
--
-- Idempotent: re-running flips existing rows to active 'author'.
-- Self-contained: also ensures the admin_whitelist role check accepts 'author'
-- (in case migration 20260504000001 hasn't been applied yet).

DO $$
DECLARE
  role_constraint text;
BEGIN
  SELECT conname INTO role_constraint
  FROM pg_constraint
  WHERE conrelid = 'public.admin_whitelist'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%role%'
    AND pg_get_constraintdef(oid) ILIKE '%owner%';

  IF role_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE admin_whitelist DROP CONSTRAINT %I', role_constraint);
  END IF;

  ALTER TABLE admin_whitelist
    ADD CONSTRAINT admin_whitelist_role_check
    CHECK (role IN ('owner', 'admin', 'editor', 'author', 'viewer'));
END $$;

INSERT INTO admin_whitelist (email, role, is_active)
VALUES
  ('varsityjohaness334@gmail.com', 'author', true),
  ('edithkibavu2@gmail.com', 'author', true)
ON CONFLICT (email) DO UPDATE
SET
  role = 'author',
  is_active = true;

SELECT email, role, is_active, created_at
FROM admin_whitelist
WHERE email IN ('varsityjohaness334@gmail.com', 'edithkibavu2@gmail.com');
