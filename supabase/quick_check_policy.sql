-- Quick check: Does the public read policy exist?
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Policy exists - avatars should work!'
    ELSE '❌ Policy does NOT exist - run migration 033'
  END as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname = 'public read careers testimonials';
