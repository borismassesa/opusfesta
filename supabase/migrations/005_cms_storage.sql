-- CMS storage bucket for hero videos/posters

INSERT INTO storage.buckets (id, name, public)
VALUES ('cms', 'cms', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
-- Note: This requires owner/superuser privileges. 
-- In Supabase, RLS is typically already enabled on storage.objects.
-- If you get a permission error, RLS is likely already enabled - just continue.
DO $$
BEGIN
  -- Attempt to enable RLS (will fail silently if we don't have permissions or it's already enabled)
  BEGIN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  EXCEPTION 
    WHEN insufficient_privilege THEN
      -- Don't have permissions - RLS is likely already enabled, continue
      RAISE NOTICE 'RLS on storage.objects: insufficient privileges (likely already enabled)';
    WHEN OTHERS THEN
      -- Other errors (like already enabled) - continue
      RAISE NOTICE 'RLS on storage.objects: %', SQLERRM;
  END;
END $$;

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
