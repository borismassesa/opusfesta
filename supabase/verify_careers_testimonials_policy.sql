-- Verification script for careers-testimonials public read policy
-- Run this after executing migration 033 to verify the policy was created correctly

-- Check if the policy exists
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname = 'public read careers testimonials';

-- If the above returns a row, the policy exists and is configured correctly.
-- The policy should allow SELECT operations on storage.objects where:
-- - bucket_id = 'careers'
-- - The first folder in the path is 'careers-testimonials'

-- Test query: Check if we can see files in the careers-testimonials folder
-- (This should work even without authentication after the policy is applied)
SELECT 
  name,
  bucket_id,
  (storage.foldername(name))[1] as first_folder
FROM storage.objects
WHERE bucket_id = 'careers'
  AND (storage.foldername(name))[1] = 'careers-testimonials'
LIMIT 10;
