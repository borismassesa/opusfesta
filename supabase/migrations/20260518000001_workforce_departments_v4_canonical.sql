-- Workforce departments — canonical v4 list.
--
-- The org has settled on 9 departments. v3 used "and"/"/" connectors;
-- the canonical form uses ampersands and drops the Interns bucket
-- (those people now live under the operational department they
-- support). Studio joins as a first-class department now that the
-- in-house production studio is staffed permanently.
--
-- Renames:
--   Marketing and Partnership → Marketing & Partnership
--   Finance and Accountings   → Finance & Accountings
--   UI/UX Design              → UI & UX Design
-- Additions:
--   Studio
-- Removals:
--   Interns  (no rows currently use it; safe to drop)
--
-- Canonical order (used as the type's union order and the default
-- DEPARTMENTS array): Technology, Marketing & Partnership, Content
-- Brand and Social Media, Finance & Accountings, UI & UX Design,
-- Operations, Studio, Founders, HR.

-- Backfill existing rows BEFORE swapping the CHECK constraint, so we
-- don't try to insert a value the old constraint would still reject.
-- (Pg evaluates the existing constraint on UPDATE.)
ALTER TABLE workforce_employees
  DROP CONSTRAINT IF EXISTS workforce_employees_department_check;

UPDATE workforce_employees
   SET department = 'Marketing & Partnership'
 WHERE department = 'Marketing and Partnership';

UPDATE workforce_employees
   SET department = 'Finance & Accountings'
 WHERE department = 'Finance and Accountings';

UPDATE workforce_employees
   SET department = 'UI & UX Design'
 WHERE department = 'UI/UX Design';

-- Sanity check: any Interns rows would block the new CHECK. Re-home
-- them to Operations so the constraint takes; admins can re-classify
-- them via the UI later.
UPDATE workforce_employees
   SET department = 'Operations'
 WHERE department = 'Interns';

ALTER TABLE workforce_employees
  ADD CONSTRAINT workforce_employees_department_check
  CHECK (department IN (
    'Technology',
    'Marketing & Partnership',
    'Content, Brand and Social Media',
    'Finance & Accountings',
    'UI & UX Design',
    'Operations',
    'Studio',
    'Founders',
    'HR'
  ));

NOTIFY pgrst, 'reload schema';
