-- Workforce departments — switch to OpusFesta's actual org structure.
--
-- The original CHECK constraint (in 20260512000004_workforce_module.sql)
-- was a placeholder set: Operations / Engineering / Product / Design /
-- Marketing / Vendor Success / Finance / People / Studio. None of those
-- map cleanly onto how the company is actually structured.
--
-- New canonical list (8):
--   Operations
--   Technology
--   Content, Brand and Social Media
--   Marketing and Partnership
--   UI/UX Design
--   Finance and Accountings
--   Interns
--   Founders
--
-- Steps:
--   1. Drop the existing CHECK constraint.
--   2. Remap any existing rows from the old vocabulary to the closest new
--      one, so the new constraint accepts them when we re-add it.
--   3. Re-add the CHECK constraint pinned to the new vocabulary.

ALTER TABLE workforce_employees
  DROP CONSTRAINT IF EXISTS workforce_employees_department_check;

-- Remap existing rows. UPDATE is idempotent — every CASE branch is a
-- direct old→new mapping; rows already on a new value are untouched.
UPDATE workforce_employees
SET department = CASE department
  WHEN 'Engineering'      THEN 'Technology'
  WHEN 'Product'          THEN 'Technology'
  WHEN 'Design'           THEN 'UI/UX Design'
  WHEN 'Marketing'        THEN 'Marketing and Partnership'
  WHEN 'Vendor Success'   THEN 'Operations'
  WHEN 'Finance'          THEN 'Finance and Accountings'
  WHEN 'People'           THEN 'Operations'
  WHEN 'Studio'           THEN 'Operations'
  ELSE department
END
WHERE department IN (
  'Engineering','Product','Design','Marketing','Vendor Success',
  'Finance','People','Studio'
);

-- Bring the founder row (the one that ships with the OpusFesta install)
-- onto the Founders bucket explicitly. We key off the employee_code so a
-- rename of full_name doesn't break the migration.
UPDATE workforce_employees
SET department = 'Founders'
WHERE employee_code = 'OF-001'
  AND department = 'Operations';

ALTER TABLE workforce_employees
  ADD CONSTRAINT workforce_employees_department_check
  CHECK (department IN (
    'Operations',
    'Technology',
    'Content, Brand and Social Media',
    'Marketing and Partnership',
    'UI/UX Design',
    'Finance and Accountings',
    'Interns',
    'Founders'
  ));

NOTIFY pgrst, 'reload schema';
