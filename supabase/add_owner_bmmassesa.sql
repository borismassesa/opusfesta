-- One-off: grant admin_whitelist 'owner' role to the active Clerk session for
-- this project. Run once in Supabase SQL Editor (against the same project the
-- opus_admin app reads from).
--
-- Idempotent: re-running flips the row to active 'owner' if it already exists.

INSERT INTO admin_whitelist (email, full_name, role, is_active)
VALUES ('bmassesa24@gmail.com', 'Boris Massesa', 'owner', true)
ON CONFLICT (email) DO UPDATE
SET
  role = 'owner',
  is_active = true,
  full_name = COALESCE(admin_whitelist.full_name, EXCLUDED.full_name);

SELECT email, full_name, role, is_active
FROM admin_whitelist
WHERE email IN ('bmassesa24@gmail.com', 'bmmassesa@gmail.com');
