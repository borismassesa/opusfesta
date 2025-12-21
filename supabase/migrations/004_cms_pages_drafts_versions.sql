-- Draft/published CMS content and versioning

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cms_pages'
      AND column_name = 'content'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cms_pages'
      AND column_name = 'published_content'
  ) THEN
    EXECUTE 'ALTER TABLE cms_pages RENAME COLUMN content TO published_content';
  END IF;
END $$;

ALTER TABLE cms_pages
  ADD COLUMN IF NOT EXISTS draft_content jsonb,
  ADD COLUMN IF NOT EXISTS published_content jsonb,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_by uuid;

UPDATE cms_pages
SET draft_content = COALESCE(draft_content, published_content),
    published_content = COALESCE(published_content, draft_content)
WHERE draft_content IS NULL OR published_content IS NULL;

CREATE TABLE IF NOT EXISTS cms_page_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id uuid NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  slug text NOT NULL,
  version_type text NOT NULL CHECK (version_type IN ('draft', 'published')),
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX IF NOT EXISTS idx_cms_page_versions_page_id ON cms_page_versions (page_id);
CREATE INDEX IF NOT EXISTS idx_cms_page_versions_slug ON cms_page_versions (slug);

CREATE OR REPLACE FUNCTION set_cms_pages_audit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by = auth.uid();
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.published AND NEW.published_at IS NULL THEN
      NEW.published_at = now();
      IF auth.uid() IS NOT NULL THEN
        NEW.published_by = auth.uid();
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.published
      AND (
        NEW.published IS DISTINCT FROM OLD.published
        OR NEW.published_content IS DISTINCT FROM OLD.published_content
      )
    THEN
      NEW.published_at = now();
      IF auth.uid() IS NOT NULL THEN
        NEW.published_by = auth.uid();
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION log_cms_page_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.draft_content IS NOT NULL THEN
      INSERT INTO cms_page_versions (page_id, slug, version_type, content, created_by)
      VALUES (NEW.id, NEW.slug, 'draft', NEW.draft_content, auth.uid());
    END IF;

    IF NEW.published_content IS NOT NULL AND NEW.published THEN
      INSERT INTO cms_page_versions (page_id, slug, version_type, content, created_by)
      VALUES (NEW.id, NEW.slug, 'published', NEW.published_content, auth.uid());
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.draft_content IS DISTINCT FROM OLD.draft_content THEN
      INSERT INTO cms_page_versions (page_id, slug, version_type, content, created_by)
      VALUES (NEW.id, NEW.slug, 'draft', NEW.draft_content, auth.uid());
    END IF;

    IF NEW.published_content IS DISTINCT FROM OLD.published_content THEN
      INSERT INTO cms_page_versions (page_id, slug, version_type, content, created_by)
      VALUES (NEW.id, NEW.slug, 'published', NEW.published_content, auth.uid());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_cms_page_version ON cms_pages;
CREATE TRIGGER log_cms_page_version
AFTER INSERT OR UPDATE ON cms_pages
FOR EACH ROW EXECUTE FUNCTION log_cms_page_version();

DROP POLICY IF EXISTS "public read published cms pages" ON cms_pages;
DROP POLICY IF EXISTS "staff read cms pages" ON cms_pages;
DROP POLICY IF EXISTS "owner/admin insert cms pages" ON cms_pages;
DROP POLICY IF EXISTS "owner/admin update cms pages" ON cms_pages;

CREATE POLICY "public read published cms pages" ON cms_pages
  FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "staff read cms pages" ON cms_pages
  FOR SELECT TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor', 'viewer'));

CREATE POLICY "owner/admin insert cms pages" ON cms_pages
  FOR INSERT TO authenticated
  WITH CHECK (cms_role() IN ('owner', 'admin'));

CREATE POLICY "owner/admin update cms pages" ON cms_pages
  FOR UPDATE TO authenticated
  USING (cms_role() IN ('owner', 'admin'))
  WITH CHECK (cms_role() IN ('owner', 'admin'));

CREATE POLICY "editor update draft cms pages" ON cms_pages
  FOR UPDATE TO authenticated
  USING (cms_role() = 'editor')
  WITH CHECK (
    cms_role() = 'editor'
    AND published IS NOT DISTINCT FROM (
      SELECT published FROM cms_pages WHERE id = cms_pages.id LIMIT 1
    )
    AND published_content IS NOT DISTINCT FROM (
      SELECT published_content FROM cms_pages WHERE id = cms_pages.id LIMIT 1
    )
    AND published_at IS NOT DISTINCT FROM (
      SELECT published_at FROM cms_pages WHERE id = cms_pages.id LIMIT 1
    )
    AND published_by IS NOT DISTINCT FROM (
      SELECT published_by FROM cms_pages WHERE id = cms_pages.id LIMIT 1
    )
  );

ALTER TABLE cms_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_versions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff read cms page versions" ON cms_page_versions;
DROP POLICY IF EXISTS "staff insert cms page versions" ON cms_page_versions;

CREATE POLICY "staff read cms page versions" ON cms_page_versions
  FOR SELECT TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor', 'viewer'));

CREATE POLICY "staff insert cms page versions" ON cms_page_versions
  FOR INSERT TO authenticated
  WITH CHECK (cms_role() IN ('owner', 'admin', 'editor'));
