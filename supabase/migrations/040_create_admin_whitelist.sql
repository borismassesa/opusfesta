-- Create admin_whitelist table for managing authorized admin users
-- This table provides a centralized way to manage admin access with additional metadata

-- Create the admin_whitelist table
CREATE TABLE IF NOT EXISTS admin_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_email ON admin_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_user_id ON admin_whitelist(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_is_active ON admin_whitelist(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_role ON admin_whitelist(role);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_whitelist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_admin_whitelist_updated_at_trigger ON admin_whitelist;
CREATE TRIGGER update_admin_whitelist_updated_at_trigger
  BEFORE UPDATE ON admin_whitelist
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_whitelist_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view the whitelist
-- Check both users table (for 'admin' role) and admin_whitelist (for 'owner' role)
DROP POLICY IF EXISTS "Admins can view whitelist" ON admin_whitelist;
CREATE POLICY "Admins can view whitelist" ON admin_whitelist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
    OR EXISTS (
      SELECT 1 FROM admin_whitelist aw
      WHERE aw.user_id = auth.uid()
      AND aw.role = 'owner'
      AND aw.is_active = true
    )
  );

-- Policy: Only owners/admins can insert into whitelist
-- Allow users with 'admin' role in users table OR 'owner' role in admin_whitelist
-- This allows initial setup by existing admins, then owners can take over
DROP POLICY IF EXISTS "Owners can insert whitelist" ON admin_whitelist;
CREATE POLICY "Owners can insert whitelist" ON admin_whitelist
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
    OR EXISTS (
      SELECT 1 FROM admin_whitelist aw
      WHERE aw.user_id = auth.uid()
      AND aw.role = 'owner'
      AND aw.is_active = true
    )
  );

-- Policy: Only owners/admins can update whitelist
DROP POLICY IF EXISTS "Owners can update whitelist" ON admin_whitelist;
CREATE POLICY "Owners can update whitelist" ON admin_whitelist
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
    OR EXISTS (
      SELECT 1 FROM admin_whitelist aw
      WHERE aw.user_id = auth.uid()
      AND aw.role = 'owner'
      AND aw.is_active = true
    )
  );

-- Policy: Only owners/admins can delete from whitelist
DROP POLICY IF EXISTS "Owners can delete whitelist" ON admin_whitelist;
CREATE POLICY "Owners can delete whitelist" ON admin_whitelist
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
    OR EXISTS (
      SELECT 1 FROM admin_whitelist aw
      WHERE aw.user_id = auth.uid()
      AND aw.role = 'owner'
      AND aw.is_active = true
    )
  );

-- Function to check if email is whitelisted (for use in API routes)
CREATE OR REPLACE FUNCTION is_admin_whitelisted(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_whitelist
    WHERE email = LOWER(check_email)
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin whitelist entry by email
CREATE OR REPLACE FUNCTION get_admin_whitelist_entry(check_email TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aw.id,
    aw.user_id,
    aw.email,
    aw.full_name,
    aw.role,
    aw.is_active,
    aw.last_login
  FROM admin_whitelist aw
  WHERE aw.email = LOWER(check_email)
  AND aw.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE admin_whitelist IS 'Centralized whitelist of authorized admin users with metadata';
COMMENT ON COLUMN admin_whitelist.user_id IS 'Reference to users table UUID';
COMMENT ON COLUMN admin_whitelist.email IS 'Email address (primary identifier for whitelist check)';
COMMENT ON COLUMN admin_whitelist.full_name IS 'Full name for display purposes';
COMMENT ON COLUMN admin_whitelist.role IS 'Admin role: owner, admin, editor, or viewer';
COMMENT ON COLUMN admin_whitelist.is_active IS 'Whether this admin is currently active (can be disabled without removing)';
COMMENT ON COLUMN admin_whitelist.added_by IS 'User ID of the admin who added this entry';
COMMENT ON COLUMN admin_whitelist.last_login IS 'Last login timestamp (updated via API)';
COMMENT ON FUNCTION is_admin_whitelisted IS 'Check if an email is in the admin whitelist and active';
COMMENT ON FUNCTION get_admin_whitelist_entry IS 'Get admin whitelist entry by email';
