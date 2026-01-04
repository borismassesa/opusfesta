-- CMS pages for marketing content (homepage, etc.)

CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages (slug);

CREATE OR REPLACE FUNCTION cms_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '');
$$;

CREATE OR REPLACE FUNCTION set_cms_pages_audit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_cms_pages_audit ON cms_pages;
CREATE TRIGGER set_cms_pages_audit
BEFORE INSERT OR UPDATE ON cms_pages
FOR EACH ROW EXECUTE FUNCTION set_cms_pages_audit();

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read published cms pages" ON cms_pages;
CREATE POLICY "public read published cms pages" ON cms_pages
  FOR SELECT TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "staff read cms pages" ON cms_pages;
CREATE POLICY "staff read cms pages" ON cms_pages
  FOR SELECT TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor', 'viewer'));

DROP POLICY IF EXISTS "owner/admin insert cms pages" ON cms_pages;
CREATE POLICY "owner/admin insert cms pages" ON cms_pages
  FOR INSERT TO authenticated
  WITH CHECK (cms_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "owner/admin update cms pages" ON cms_pages;
CREATE POLICY "owner/admin update cms pages" ON cms_pages
  FOR UPDATE TO authenticated
  USING (cms_role() IN ('owner', 'admin'))
  WITH CHECK (cms_role() IN ('owner', 'admin'));
