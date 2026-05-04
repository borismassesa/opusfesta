-- Migration: harden requesting_user_id() against Clerk-shaped JWT subs.
--
-- Background: requesting_user_id() looks up public.users.id by clerk_id from
-- auth.jwt()->>'sub'. When the user has no matching public.users row yet
-- (typical for a brand-new Clerk sign-in before the user is provisioned),
-- the function previously fell back to auth.uid(). Supabase's auth.uid()
-- casts the JWT sub claim to UUID — but Clerk subs look like
-- 'user_3D6XCxic56PrmqjYhAu5GaQikSa', which fails the cast with
-- '22P02 invalid input syntax for type uuid', crashing every RLS-bound
-- query in the portal.
--
-- Fix: skip the auth.uid() fallback unless the sub is UUID-shaped. For
-- Clerk users without a public.users row, we now return NULL instead of
-- raising — RLS evaluates as no rows, and getCurrentVendor() resolves to
-- 'no-membership' so the portal renders the /pending page cleanly.

CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_sub TEXT;
  has_clerk_id BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'clerk_id'
  ) INTO has_clerk_id;

  IF has_clerk_id THEN
    v_sub := auth.jwt()->>'sub';
    IF v_sub IS NOT NULL THEN
      SELECT id
      INTO v_user_id
      FROM public.users
      WHERE clerk_id = v_sub
      LIMIT 1;
    END IF;
  END IF;

  -- Only fall back to auth.uid() when the sub claim is UUID-shaped, i.e.
  -- a native Supabase auth user. Clerk subs ('user_…') would otherwise
  -- throw 22P02 inside auth.uid()'s UUID cast.
  IF v_user_id IS NULL AND v_sub IS NOT NULL
     AND v_sub ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  THEN
    v_user_id := auth.uid();
  END IF;

  RETURN v_user_id;
END;
$$;
