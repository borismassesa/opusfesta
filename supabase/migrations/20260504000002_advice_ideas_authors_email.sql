-- Link advice_ideas_authors bios to a Clerk-authenticated email so authors
-- with role 'author' can only edit / upload to their own profile row.
--
-- The constraint is UNIQUE-when-set (partial index) so existing legacy rows
-- without an email keep working until they're claimed by a real account.

DO $$
BEGIN
  IF to_regclass('public.advice_ideas_authors') IS NULL THEN
    RAISE EXCEPTION 'advice_ideas_authors table is missing — apply 20260423000012 first';
  END IF;
END $$;

ALTER TABLE advice_ideas_authors
  ADD COLUMN IF NOT EXISTS email text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_advice_ideas_authors_email
  ON advice_ideas_authors (LOWER(email))
  WHERE email IS NOT NULL;

COMMENT ON COLUMN advice_ideas_authors.email IS
  'Clerk-authenticated email of the author who owns this bio. Authors with role ''author'' can only upsert / upload against rows where this matches their session email.';
