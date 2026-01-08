-- Add INSERT policy for users table
-- This allows authenticated users to create their own user record when they sign up
-- The policy ensures users can only insert records where the id matches their auth.uid()

-- Drop existing policy if it exists (in case of re-runs)
DROP POLICY IF EXISTS "Users can insert their own record" ON users;

-- Create policy to allow authenticated users to insert their own record
CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add comment for documentation
COMMENT ON POLICY "Users can insert their own record" ON users IS 
  'Allows authenticated users to create their own user record in the public.users table when they sign up. The user_id must match their auth.uid().';
