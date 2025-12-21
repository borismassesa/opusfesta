-- CMS storage bucket for hero videos/posters

INSERT INTO storage.buckets (id, name, public)
VALUES ('cms', 'cms', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read cms assets" ON storage.objects;
DROP POLICY IF EXISTS "cms insert assets" ON storage.objects;
DROP POLICY IF EXISTS "cms update assets" ON storage.objects;
DROP POLICY IF EXISTS "cms delete assets" ON storage.objects;

CREATE POLICY "public read cms assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'cms');

CREATE POLICY "cms insert assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cms'
    AND cms_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "cms update assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'cms'
    AND cms_role() IN ('owner', 'admin', 'editor')
  )
  WITH CHECK (
    bucket_id = 'cms'
    AND cms_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "cms delete assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'cms'
    AND cms_role() IN ('owner', 'admin', 'editor')
  );
