-- Quick script to create vendor-assets storage bucket
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Create the vendor-assets bucket (public bucket for vendor images)
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

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "public read vendor assets" ON storage.objects;
DROP POLICY IF EXISTS "vendors insert assets" ON storage.objects;
DROP POLICY IF EXISTS "vendors update assets" ON storage.objects;
DROP POLICY IF EXISTS "vendors delete assets" ON storage.objects;

-- Allow public read access to vendor assets
CREATE POLICY "public read vendor assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vendor-assets');

-- Allow authenticated users to insert assets to logos, covers, and portfolio folders
CREATE POLICY "vendors insert assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vendor-assets'
    AND (
      (storage.foldername(name))[1] = 'logos'
      OR (storage.foldername(name))[1] = 'covers'
      OR (storage.foldername(name))[1] = 'portfolio'
    )
  );

-- Allow authenticated users to update assets
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

-- Allow authenticated users to delete assets
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
