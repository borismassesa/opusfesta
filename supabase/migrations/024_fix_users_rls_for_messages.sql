-- Fix users RLS to allow vendors to see customer data in message threads
-- This allows vendors to see customer names/emails in message threads

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Vendors can view users in their message threads" ON users;
DROP POLICY IF EXISTS "Users can view vendors in their message threads" ON users;

-- Add policy to allow vendors to see user data for threads they're part of
CREATE POLICY "Vendors can view users in their message threads"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      JOIN vendors ON vendors.id = message_threads.vendor_id
      WHERE message_threads.user_id = users.id
      AND vendors.user_id = auth.uid()
    )
  );

-- Also allow users to see vendor owner data in threads they're part of
CREATE POLICY "Users can view vendors in their message threads"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      JOIN vendors ON vendors.user_id = users.id
      WHERE message_threads.user_id = auth.uid()
      AND message_threads.vendor_id = vendors.id
    )
  );

-- Add comment
COMMENT ON POLICY "Vendors can view users in their message threads" ON users IS 
  'Allows vendors to see customer user data (name, email, avatar) in message threads';

COMMENT ON POLICY "Users can view vendors in their message threads" ON users IS 
  'Allows customers to see vendor owner user data in message threads';
