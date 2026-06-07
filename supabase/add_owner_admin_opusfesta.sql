-- Grant admin_whitelist 'owner' role to admin@opusfesta.com — the durable
-- replacement for the temporary /temp-access passcode. Run once against the
-- SAME Supabase project the opus_admin app reads from (prod:
-- ppdapuqehwlfwofbpbvb). Safe to run in the Supabase SQL Editor.
--
-- Idempotent: re-running flips the row to active 'owner' if it already exists.
--
-- NOTE: this only grants the *authorization*. The account must also exist in
-- the shared Clerk instance (clerk.opusfesta.com) so it can authenticate —
-- sign up / provision admin@opusfesta.com there, then sign in (password or the
-- "email me a code" option) and the dashboard opens with full owner control.

INSERT INTO admin_whitelist (email, full_name, role, is_active)
VALUES ('admin@opusfesta.com', 'OpusFesta Admin', 'owner', true)
ON CONFLICT (email) DO UPDATE
SET
  role = 'owner',
  is_active = true,
  full_name = COALESCE(admin_whitelist.full_name, EXCLUDED.full_name);

SELECT email, full_name, role, is_active
FROM admin_whitelist
WHERE email = 'admin@opusfesta.com';
