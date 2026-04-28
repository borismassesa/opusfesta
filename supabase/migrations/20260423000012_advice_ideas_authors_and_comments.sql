-- Add seed-comments column to posts and create an authors table so bios /
-- avatars for the Author Card on the article detail page are CMS-managed.

ALTER TABLE advice_ideas_posts
  ADD COLUMN IF NOT EXISTS seed_comments jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS advice_ideas_authors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  initials text NOT NULL DEFAULT '',
  avatar_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advice_ideas_authors_key ON advice_ideas_authors (key);

DROP TRIGGER IF EXISTS update_advice_ideas_authors_updated_at ON advice_ideas_authors;
CREATE TRIGGER update_advice_ideas_authors_updated_at BEFORE UPDATE ON advice_ideas_authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE advice_ideas_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_ideas_authors FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read authors" ON advice_ideas_authors;
CREATE POLICY "public read authors" ON advice_ideas_authors
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "service role full access authors" ON advice_ideas_authors;
CREATE POLICY "service role full access authors"
  ON advice_ideas_authors FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "staff write authors" ON advice_ideas_authors;
CREATE POLICY "staff write authors" ON advice_ideas_authors
  FOR ALL TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor'))
  WITH CHECK (cms_role() IN ('owner', 'admin', 'editor'));
