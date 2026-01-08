-- Check if avatar path is saved in the database for careers page
-- Run this to see what avatar value is stored in the CMS

SELECT 
  slug,
  draft_content->'testimonials'->'items'->0->>'avatar' as avatar_path,
  draft_content->'testimonials'->'items'->0->>'name' as testimonial_name,
  draft_content->'testimonials'->'items'->0->>'quote' as testimonial_quote,
  updated_at
FROM cms_pages 
WHERE slug = 'careers';

-- If avatar_path is NULL or empty, the avatar hasn't been saved to the database yet.
-- Make sure to:
-- 1. Upload the avatar in the admin editor
-- 2. Click "Save" to persist it to the database
-- 3. Check the preview again

-- To test the public URL construction, you can manually construct it:
-- Format: {SUPABASE_URL}/storage/v1/object/public/careers/{avatar_path}
-- Example: https://xxxxx.supabase.co/storage/v1/object/public/careers/careers-testimonials/1767755678022-qi080gf9msa.JPG
