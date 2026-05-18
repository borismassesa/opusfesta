-- =============================================================================
-- Finance > Expenses module
--
-- Adds two tables for employee expense management:
--   finance_expense_categories — chart-of-accounts buckets (travel, meals, etc.)
--   finance_expenses           — individual expense receipts/claims
--
-- The opus_admin /finance/expenses page reads/writes these through the
-- service-role admin client (which bypasses RLS); the policies below are
-- belt-and-braces in case anonymous or end-user clients ever touch the
-- table directly.
-- =============================================================================

-- finance_expense_categories ---------------------------------------------------

CREATE TABLE IF NOT EXISTS finance_expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  account_code text,            -- chart-of-accounts code; null until finance maps it
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- finance_expenses -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS finance_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,                       -- "REF0001"
  employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  description text NOT NULL,
  expense_date date NOT NULL,
  category_id uuid REFERENCES finance_expense_categories(id) ON DELETE SET NULL,
  paid_by text NOT NULL DEFAULT 'employee'
    CHECK (paid_by IN ('employee', 'company')),
  total_tzs bigint NOT NULL CHECK (total_tzs >= 0),
  currency text NOT NULL DEFAULT 'TZS',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'approved', 'in_payment', 'paid', 'refused', 'posted')),
  receipt_url text,
  notes text,
  analytic_distribution text,                           -- free-text tag like "Laoreet Id"
  activities_count integer NOT NULL DEFAULT 0,
  submitted_at timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  refused_at timestamptz,
  refused_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_expenses_employee
  ON finance_expenses (employee_id);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_status
  ON finance_expenses (status);
CREATE INDEX IF NOT EXISTS idx_finance_expenses_date
  ON finance_expenses (expense_date DESC);

-- updated_at triggers ----------------------------------------------------------

DROP TRIGGER IF EXISTS trg_finance_expense_categories_updated_at ON finance_expense_categories;
CREATE TRIGGER trg_finance_expense_categories_updated_at
  BEFORE UPDATE ON finance_expense_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_finance_expenses_updated_at ON finance_expenses;
CREATE TRIGGER trg_finance_expenses_updated_at
  BEFORE UPDATE ON finance_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS — admin-only across the board --------------------------------------------

ALTER TABLE finance_expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "finance_expense_categories_read" ON finance_expense_categories;
CREATE POLICY "finance_expense_categories_read"
  ON finance_expense_categories FOR SELECT TO authenticated
  USING (is_workforce_reader());

DROP POLICY IF EXISTS "finance_expense_categories_write" ON finance_expense_categories;
CREATE POLICY "finance_expense_categories_write"
  ON finance_expense_categories FOR ALL TO authenticated
  USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());

DROP POLICY IF EXISTS "finance_expenses_read" ON finance_expenses;
CREATE POLICY "finance_expenses_read"
  ON finance_expenses FOR SELECT TO authenticated
  USING (is_workforce_reader());

DROP POLICY IF EXISTS "finance_expenses_write" ON finance_expenses;
CREATE POLICY "finance_expenses_write"
  ON finance_expenses FOR ALL TO authenticated
  USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());

-- Seed: a sensible default chart of expense categories -------------------------

INSERT INTO finance_expense_categories (slug, name, account_code) VALUES
  ('travel',         'Travel',          '6210'),
  ('meals',          'Meals & client entertainment', '6220'),
  ('accommodation',  'Accommodation',   '6230'),
  ('transport',      'Local transport', '6240'),
  ('supplies',       'Office supplies', '6310'),
  ('equipment',      'Equipment',       '6320'),
  ('software',       'Software & subscriptions', '6330'),
  ('marketing',      'Marketing',       '6410'),
  ('training',       'Training',        '6510'),
  ('communication',  'Mobile & internet','6610'),
  ('utilities',      'Utilities',       '6620'),
  ('misc',           'Other / miscellaneous', '6900')
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE finance_expense_categories IS 'Finance module — expense category chart. RLS: admin-only.';
COMMENT ON TABLE finance_expenses           IS 'Finance module — employee expense claims with approval lifecycle. RLS: admin-only.';

NOTIFY pgrst, 'reload schema';
