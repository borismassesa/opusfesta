-- Remove the workforce fixture data (18 employees, 5 jobs, all their
-- shifts/leave/attendance/candidates) so the Workforce module ships
-- empty. Admins populate it via the UI from here on. CASCADE handles
-- the dependent rows: shifts, leave_requests, attendance, role_members
-- via workforce_employees; candidates via workforce_jobs.
--
-- The matching INSERT blocks were also removed from
-- 20260512000004_workforce_module.sql, so a fresh `supabase db reset`
-- produces the same end state without going through INSERT-then-DELETE.

DELETE FROM public.workforce_employees
WHERE employee_code IN (
  'OF-001','OF-002','OF-003','OF-004','OF-005','OF-006',
  'OF-007','OF-008','OF-009','OF-010','OF-011','OF-012',
  'OF-013','OF-014','OF-015','OF-016','OF-017','OF-018'
);

DELETE FROM public.workforce_jobs
WHERE slug IN (
  'senior-fullstack-engineer',
  'vendor-onboarding-specialist',
  'studio-production-lead',
  'finance-analyst-tax',
  'lifecycle-marketing'
);
