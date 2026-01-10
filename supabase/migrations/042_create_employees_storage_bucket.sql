-- Employees storage bucket for employee documents
-- This migration creates the storage bucket and policies for employee document uploads

-- Create the employees bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'employees', 
  'employees', 
  false, -- Private bucket - only admins can access
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
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
DROP POLICY IF EXISTS "admins insert employee documents" ON storage.objects;
DROP POLICY IF EXISTS "admins read employee documents" ON storage.objects;
DROP POLICY IF EXISTS "admins update employee documents" ON storage.objects;
DROP POLICY IF EXISTS "admins delete employee documents" ON storage.objects;

-- Admins can insert employee documents
CREATE POLICY "admins insert employee documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can read employee documents
CREATE POLICY "admins read employee documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update employee documents
CREATE POLICY "admins update employee documents" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can delete employee documents
CREATE POLICY "admins delete employee documents" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'employees'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
