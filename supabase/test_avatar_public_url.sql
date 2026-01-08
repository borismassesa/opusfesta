-- Test if the public read policy is working
-- This will show if files in careers-testimonials can be accessed publicly

-- First, verify the policy exists
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname = 'public read careers testimonials';

-- If the above returns a row, the policy exists.
-- If it returns no rows, you need to run migration 033.

-- Test: Show the path and URL format
-- Replace {SUPABASE_URL} with your actual Supabase project URL from your .env file
-- Example: https://xxxxx.supabase.co/storage/v1/object/public/careers/careers-testimonials/1767842114697-ubbuztxwde.png

SELECT 
  'careers-testimonials/1767842114697-ubbuztxwde.png' as avatar_path,
  'Construct URL as: {SUPABASE_URL}/storage/v1/object/public/careers/careers-testimonials/1767842114697-ubbuztxwde.png' as url_format,
  'Get SUPABASE_URL from: apps/website/.env.local (NEXT_PUBLIC_SUPABASE_URL)' as note;
