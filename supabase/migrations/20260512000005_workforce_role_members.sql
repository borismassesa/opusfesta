-- Workforce role membership — the join table that wires employees to
-- the workforce_roles defined in 20260512000004_workforce_module.sql.
--
-- Many-to-many on purpose: someone can hold "People Ops" + "Finance"
-- at once. The original `workforce_roles.members_count` integer becomes
-- a denormalised cache; this migration keeps it in sync via a trigger
-- so existing reads (KPI cards) don't have to change shape.

CREATE TABLE IF NOT EXISTS workforce_role_members (
  role_id     uuid NOT NULL REFERENCES workforce_roles(id)     ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES workforce_employees(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES admin_whitelist(id) ON DELETE SET NULL,
  PRIMARY KEY (role_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_workforce_role_members_employee
  ON workforce_role_members (employee_id);

ALTER TABLE workforce_role_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workforce_role_members_read" ON workforce_role_members;
CREATE POLICY "workforce_role_members_read" ON workforce_role_members
  FOR SELECT TO authenticated USING (is_workforce_reader());

DROP POLICY IF EXISTS "workforce_role_members_write" ON workforce_role_members;
CREATE POLICY "workforce_role_members_write" ON workforce_role_members
  FOR ALL TO authenticated
  USING (is_workforce_admin())
  WITH CHECK (is_workforce_admin());

-- Keep workforce_roles.members_count in sync. Triggered after every
-- insert/delete so the KPI cards don't have to count() at read time.
CREATE OR REPLACE FUNCTION public.refresh_workforce_role_members_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE workforce_roles
      SET members_count = (
        SELECT count(*) FROM workforce_role_members WHERE role_id = NEW.role_id
      )
      WHERE id = NEW.role_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE workforce_roles
      SET members_count = (
        SELECT count(*) FROM workforce_role_members WHERE role_id = OLD.role_id
      )
      WHERE id = OLD.role_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_workforce_role_members_count
  ON workforce_role_members;
CREATE TRIGGER trg_workforce_role_members_count
  AFTER INSERT OR DELETE ON workforce_role_members
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_workforce_role_members_count();

-- Backfill: redistribute the seed `members_count` figures across real
-- employees so the dashboards aren't blank the first time they load.
-- The mapping is intentional and informed by department, not random:
--   Owner          -> founders (Asha, Daniel)
--   Admin          -> heads/leads (Daniel, Hassan, Boniface, Grace)
--   People Ops     -> People + Operations heads (Joyce, Asha)
--   Finance        -> Finance (Imani) + Operations head (Asha)
--   Content Editor -> Marketing folks (Grace, Naomi) + Design (Catherine)
--   Vendor Success -> Vendor Success + adjacents (Boniface, Lulu,
--                     Faraja, Mussa, Paulina)
--   Viewer         -> ICs without write access (Faraja, Mussa, Kelvin,
--                     Queen)
--
-- Idempotent — no-ops if the row already exists.

WITH mapping(role_slug, employee_code) AS (VALUES
  ('owner',          'OF-001'),
  ('owner',          'OF-004'),
  ('admin',          'OF-004'),
  ('admin',          'OF-008'),
  ('admin',          'OF-002'),
  ('admin',          'OF-007'),
  ('people-ops',     'OF-010'),
  ('people-ops',     'OF-001'),
  ('finance',        'OF-009'),
  ('finance',        'OF-001'),
  ('content-editor', 'OF-007'),
  ('content-editor', 'OF-014'),
  ('content-editor', 'OF-003'),
  ('vendor-success', 'OF-002'),
  ('vendor-success', 'OF-012'),
  ('vendor-success', 'OF-006'),
  ('vendor-success', 'OF-013'),
  ('vendor-success', 'OF-016'),
  ('viewer',         'OF-006'),
  ('viewer',         'OF-013'),
  ('viewer',         'OF-011'),
  ('viewer',         'OF-017')
)
INSERT INTO workforce_role_members (role_id, employee_id)
SELECT r.id, e.id
FROM mapping m
JOIN workforce_roles r ON r.slug = m.role_slug
JOIN workforce_employees e ON e.employee_code = m.employee_code
ON CONFLICT DO NOTHING;

COMMENT ON TABLE workforce_role_members IS
  'Workforce module — join table mapping employees to roles (M:N). RLS: admin-only.';

NOTIFY pgrst, 'reload schema';
