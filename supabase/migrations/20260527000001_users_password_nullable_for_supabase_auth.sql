-- Make public.users.password nullable so Supabase-auth-provisioned couples
-- (magic-link, no password) can be inserted. Legacy Clerk-era rows keep
-- whatever was there. Authentication is now handled by auth.users; the
-- column is retained only because older tables/triggers may still reference it.

ALTER TABLE users
  ALTER COLUMN password DROP NOT NULL;
