-- Add awards folder to vendor-assets storage policies
-- This allows vendors to upload award certificate images

-- Drop existing policies to recreate them with awards folder
DROP POLICY IF EXISTS "vendors insert assets" ON storage.objects;
DROP POLICY IF EXISTS "vendors update assets" ON storage.objects;
DROP POLICY IF EXISTS "vendors delete assets" ON storage.objects;

-- Allow authenticated vendors to insert their own assets (including awards)
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
      OR
      -- Allow uploads to awards folder
      (storage.foldername(name))[1] = 'awards'
    )
  );

-- Allow authenticated vendors to update their own assets (including awards)
CREATE POLICY "vendors update assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vendor-assets'
    AND (
      (storage.foldername(name))[1] = 'logos'
      OR (storage.foldername(name))[1] = 'covers'
      OR (storage.foldername(name))[1] = 'portfolio'
      OR (storage.foldername(name))[1] = 'awards'
    )
  )
  WITH CHECK (
    bucket_id = 'vendor-assets'
    AND (
      (storage.foldername(name))[1] = 'logos'
      OR (storage.foldername(name))[1] = 'covers'
      OR (storage.foldername(name))[1] = 'portfolio'
      OR (storage.foldername(name))[1] = 'awards'
    )
  );

-- Allow authenticated vendors to delete their own assets (including awards)
CREATE POLICY "vendors delete assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'vendor-assets'
    AND (
      (storage.foldername(name))[1] = 'logos'
      OR (storage.foldername(name))[1] = 'covers'
      OR (storage.foldername(name))[1] = 'portfolio'
      OR (storage.foldername(name))[1] = 'awards'
    )
  );
