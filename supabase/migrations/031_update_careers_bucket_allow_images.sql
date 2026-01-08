-- Update careers bucket to allow image MIME types for job images
-- This allows the bucket to store both resumes (PDF/DOC) and job images (JPEG/PNG/WebP)

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]
WHERE id = 'careers';

-- Add RLS policy to allow admins to insert into careers bucket (any folder)
-- This matches the pattern of admin read/delete policies which don't restrict by folder
DROP POLICY IF EXISTS "admins insert careers" ON storage.objects;
CREATE POLICY "admins insert careers" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Also allow admins to update files in careers bucket (for replacing images)
DROP POLICY IF EXISTS "admins update careers" ON storage.objects;
CREATE POLICY "admins update careers" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'careers'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
