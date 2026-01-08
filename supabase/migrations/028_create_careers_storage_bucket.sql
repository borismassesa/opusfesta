-- Careers storage bucket for resume/CV uploads

-- Create the careers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'careers', 
  'careers', 
  false, -- Private bucket - only admins can access
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE
SET public = false;

-- Enable RLS on storage.objects if not already enabled
DO $$
BEGIN
  BEGIN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  EXCEPTION 
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'RLS on storage.objects: insufficient privileges (likely already enabled)';
    WHEN OTHERS THEN
      RAISE NOTICE 'RLS on storage.objects: %', SQLERRM;
  END;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public insert resumes" ON storage.objects;
DROP POLICY IF EXISTS "admins read resumes" ON storage.objects;
DROP POLICY IF EXISTS "admins delete resumes" ON storage.objects;

-- Allow public to insert resumes (for job applications)
CREATE POLICY "public insert resumes" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'careers'
    AND (storage.foldername(name))[1] = 'resumes'
  );

-- Admins can read all resumes
CREATE POLICY "admins read resumes" ON storage.objects
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

-- Admins can delete resumes
CREATE POLICY "admins delete resumes" ON storage.objects
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
