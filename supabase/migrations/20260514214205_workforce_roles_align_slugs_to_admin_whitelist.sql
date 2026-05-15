-- Align workforce_roles.slug values with admin_whitelist.role values so the
-- People table and the Roles catalog can share a single role list. The
-- only mismatches before this migration:
--   admin_whitelist 'editor'  vs  workforce_roles 'content-editor'
--   admin_whitelist 'author'  vs  no matching workforce_role
--
-- After this migration every value of admin_whitelist.role has a matching
-- workforce_roles.slug, so the UI never has to translate.

-- 1. Rename content-editor → editor. ON CONFLICT skip if both already exist.
UPDATE workforce_roles
   SET slug = 'editor',
       name = 'Editor'
 WHERE slug = 'content-editor'
   AND NOT EXISTS (SELECT 1 FROM workforce_roles WHERE slug = 'editor');

-- 2. Add an 'author' role. Authors live under /contribute and have no
--    dashboard permissions of their own — but the catalog still needs a
--    row so the People tab can label their dashboard role correctly.
INSERT INTO workforce_roles (slug, name, description, permission_keys, members_count, is_system)
VALUES (
  'author',
  'Author',
  'Contributors who write articles via /contribute. No admin dashboard access by default.',
  ARRAY[]::text[],
  0,
  true
)
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';
