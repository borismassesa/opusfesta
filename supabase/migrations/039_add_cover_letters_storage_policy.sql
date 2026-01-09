-- Add storage policy to allow public uploads of cover letters
-- This allows job applicants to upload cover letter files to the careers bucket

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "public insert cover letters" ON storage.objects;
DROP POLICY IF EXISTS "authenticated insert cover letters" ON storage.objects;

-- Allow public to insert cover letters (for job applications)
-- This matches the resumes policy - public uploads are allowed
-- The apply page itself requires authentication, so this is safe
CREATE POLICY "public insert cover letters" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'careers'
    AND (storage.foldername(name))[1] = 'cover-letters'
  );

-- Update admin read policy to include cover letters
-- The existing "admins read resumes" policy only covers resumes folder
-- We need to update it to cover all folders in careers bucket, or create a separate policy
-- Let's update the existing policy to be more general for admins

-- Drop the old admin read policy
DROP POLICY IF EXISTS "admins read resumes" ON storage.objects;
-- Drop the new policy if it already exists (for idempotency)
DROP POLICY IF EXISTS "admins read careers files" ON storage.objects;

-- Create a new policy that allows admins to read all files in careers bucket
CREATE POLICY "admins read careers files" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Update admin delete policy to cover all careers files
DROP POLICY IF EXISTS "admins delete resumes" ON storage.objects;
-- Drop the new policy if it already exists (for idempotency)
DROP POLICY IF EXISTS "admins delete careers files" ON storage.objects;

CREATE POLICY "admins delete careers files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
