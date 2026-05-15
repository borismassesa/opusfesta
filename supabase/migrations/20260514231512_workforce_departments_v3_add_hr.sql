-- Workforce departments — add HR to the canonical list.
--
-- 20260514225651_workforce_departments_v2.sql introduced the 8-department
-- structure. The org has since carved out an HR function (separate from
-- Operations) — large enough on its own to have a tailored dashboard
-- lane (leave requests, recruitment pipeline, anniversaries) and small
-- enough that it didn't justify v2's full rename pass.
--
-- This migration only adds HR — no existing rows need remapping.

ALTER TABLE workforce_employees
  DROP CONSTRAINT IF EXISTS workforce_employees_department_check;

ALTER TABLE workforce_employees
  ADD CONSTRAINT workforce_employees_department_check
  CHECK (department IN (
    'Operations',
    'Technology',
    'Content, Brand and Social Media',
    'Marketing and Partnership',
    'UI/UX Design',
    'Finance and Accountings',
    'HR',
    'Interns',
    'Founders'
  ));

NOTIFY pgrst, 'reload schema';
