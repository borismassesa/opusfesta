-- Allow public read access to careers-testimonials folder (for avatar images)
-- This allows the website to display testimonial avatars without authentication
-- while keeping resumes and other folders in the careers bucket private

-- Drop policy if it exists (for idempotency)
DROP POLICY IF EXISTS "public read careers testimonials" ON storage.objects;

-- Create public read policy for careers-testimonials folder
CREATE POLICY "public read careers testimonials" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'careers'
    AND (storage.foldername(name))[1] = 'careers-testimonials'
  );
