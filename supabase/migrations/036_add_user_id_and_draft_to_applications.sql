-- Add user_id and is_draft columns to job_applications table
-- This migration enables user authentication for applications and draft functionality

-- 1. Add user_id column (nullable to support existing applications)
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add is_draft column
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;

-- 3. Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);

-- 4. Create index on is_draft for filtering
CREATE INDEX IF NOT EXISTS idx_job_applications_is_draft ON job_applications(is_draft);

-- 5. Create composite index for user_id + is_draft queries
CREATE INDEX IF NOT EXISTS idx_job_applications_user_draft ON job_applications(user_id, is_draft) WHERE user_id IS NOT NULL;

-- 6. Remove public insert policy (applications now require authentication)
DROP POLICY IF EXISTS "public insert applications" ON job_applications;

-- 7. Create policy for users to insert their own applications
DROP POLICY IF EXISTS "users insert own applications" ON job_applications;
CREATE POLICY "users insert own applications" ON job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      user_id IS NULL OR user_id = auth.uid()
    )
  );

-- 8. Create policy for users to read their own applications (including drafts)
DROP POLICY IF EXISTS "users read own applications" ON job_applications;
CREATE POLICY "users read own applications" ON job_applications
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- 9. Create policy for users to update their own draft applications only
DROP POLICY IF EXISTS "users update own draft applications" ON job_applications;
CREATE POLICY "users update own draft applications" ON job_applications
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND is_draft = true
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND is_draft = true
  );

-- Note: Admin policies from migration 027 remain unchanged
-- Admins can still do everything via existing "admins read applications" and "admins update applications" policies
