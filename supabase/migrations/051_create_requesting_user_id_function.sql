-- Migration 051: Create requesting_user_id() helper function
-- Bridge between Clerk's string IDs and existing UUID-based foreign keys
-- Called once per SQL statement (STABLE), uses indexed clerk_id column for O(1) lookup

CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE clerk_id = (auth.jwt()->>'sub')
$$;
