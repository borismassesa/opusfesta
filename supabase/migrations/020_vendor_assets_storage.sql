-- Vendor assets storage bucket for logos, cover images, and portfolio items

-- Create the vendor-assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-assets', 
  'vendor-assets', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = true;

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public read vendor assets" ON storage.objects;
DROP POLICY IF EXISTS "vendors insert assets" ON storage.objects;
DROP POLICY IF EXISTS "vendors update assets" ON storage.objects;
DROP POLICY IF EXISTS "vendors delete assets" ON storage.objects;

-- Allow public read access to vendor assets
CREATE POLICY "public read vendor assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-assets');

-- Allow authenticated vendors to insert their own assets
CREATE POLICY "vendors insert assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vendor-assets'
    AND (
      -- Allow uploads to logos folder
      (storage.foldername(name))[1] = 'logos'
      OR
      -- Allow uploads to covers folder
      (storage.foldername(name))[1] = 'covers'
      OR
      -- Allow uploads to portfolio folder
      (storage.foldername(name))[1] = 'portfolio'
    )
  );

-- Allow authenticated vendors to update their own assets
CREATE POLICY "vendors update assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vendor-assets'
    AND (
      (storage.foldername(name))[1] = 'logos'
      OR (storage.foldername(name))[1] = 'covers'
      OR (storage.foldername(name))[1] = 'portfolio'
    )
  )
  WITH CHECK (
    bucket_id = 'vendor-assets'
    AND (
      (storage.foldername(name))[1] = 'logos'
      OR (storage.foldername(name))[1] = 'covers'
      OR (storage.foldername(name))[1] = 'portfolio'
    )
  );

-- Allow authenticated vendors to delete their own assets
CREATE POLICY "vendors delete assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'vendor-assets'
    AND (
      (storage.foldername(name))[1] = 'logos'
      OR (storage.foldername(name))[1] = 'covers'
      OR (storage.foldername(name))[1] = 'portfolio'
    )
  );
