-- admin_whitelist: create + seed from the workforce directory.
--
-- The role/access gate in apps/opus_admin/src/lib/admin-auth.ts reads
-- `admin_whitelist`, but the table only existed in the legacy NUMBERED script
-- (supabase/migrations/040_create_admin_whitelist.sql), which the timestamped
-- migration runner never applies — so fresh environments (and prod) never got
-- it, leaving DISABLE_ADMIN_AUTH / the temp passcode as the only way in.
--
-- This timestamped migration makes the table part of the tracked sequence and
-- seeds it from every employee who already has dashboard access, so real,
-- role-scoped auth works automatically on any environment. All statements are
-- idempotent and safe to re-run.

-- 1) Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS idx_admin_whitelist_email ON admin_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_user_id ON admin_whitelist(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_is_active ON admin_whitelist(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_role ON admin_whitelist(role);

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION update_admin_whitelist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_whitelist_updated_at_trigger ON admin_whitelist;
CREATE TRIGGER update_admin_whitelist_updated_at_trigger
  BEFORE UPDATE ON admin_whitelist
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_whitelist_updated_at();

-- RLS: the opus_admin app reads via the service role (bypasses RLS); these
-- policies only constrain any direct authenticated access. Deny-by-default with
-- owner/admin read+write, mirroring 040.
ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view whitelist" ON admin_whitelist;
CREATE POLICY "Admins can view whitelist" ON admin_whitelist
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'::user_role)
    OR EXISTS (SELECT 1 FROM admin_whitelist aw WHERE aw.user_id = auth.uid() AND aw.role = 'owner' AND aw.is_active = true)
  );

DROP POLICY IF EXISTS "Owners can write whitelist" ON admin_whitelist;
CREATE POLICY "Owners can write whitelist" ON admin_whitelist
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'::user_role)
    OR EXISTS (SELECT 1 FROM admin_whitelist aw WHERE aw.user_id = auth.uid() AND aw.role = 'owner' AND aw.is_active = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'::user_role)
    OR EXISTS (SELECT 1 FROM admin_whitelist aw WHERE aw.user_id = auth.uid() AND aw.role = 'owner' AND aw.is_active = true)
  );

-- 2) Seed from the workforce directory --------------------------------------
-- Grant each employee who has dashboard access a whitelist row, mapping their
-- workforce dashboard role to the access role. admin_whitelist gates access +
-- the high-level role; granular permissions still come from workforce_roles.
-- Re-running re-syncs roles and reactivates rows.
INSERT INTO admin_whitelist (email, full_name, role, is_active)
SELECT
  lower(e.email),
  e.full_name,
  CASE r.slug
    WHEN 'owner'          THEN 'owner'
    WHEN 'admin'          THEN 'admin'
    WHEN 'editor'         THEN 'editor'
    WHEN 'content-editor' THEN 'editor'
    WHEN 'viewer'         THEN 'viewer'
    -- Custom ops roles (finance / people-ops / vendor-success): access ticket
    -- at 'viewer'; their real permissions come from workforce_roles.
    ELSE 'viewer'
  END,
  true
FROM workforce_employees e
JOIN workforce_roles r ON r.id = e.dashboard_role_id
WHERE e.dashboard_access = true
  AND e.email IS NOT NULL
  AND e.email <> ''
  -- Authors live on /contribute, not the admin dashboard — never whitelist.
  AND r.slug <> 'author'
ON CONFLICT (email) DO UPDATE
SET role      = EXCLUDED.role,
    is_active = true,
    full_name = COALESCE(admin_whitelist.full_name, EXCLUDED.full_name);
