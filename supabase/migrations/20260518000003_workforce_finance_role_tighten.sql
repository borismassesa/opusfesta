-- Finance role: separation of duties cleanup.
--
-- Originally the Finance role carried workforce.write so they could
-- view the Timesheets page (which was gated on workforce.write). The
-- side-effect was that Finance could also edit employee records, post
-- jobs, and change platform Roles — which conflates payroll-prep with
-- HR administration.
--
-- This migration:
--   1. Demotes the workforce/timesheets sidebar + page gate from
--      workforce.write to workforce.read in the admin app (see commit).
--      Mutations inside the Timesheets page still require
--      workforce.write at the server-action layer.
--   2. Strips workforce.write from the Finance role here. Finance keeps
--      workforce.read (so they can see Employees, Schedule, Leave &
--      Attendance, and Timesheets read-only) and workforce.payroll
--      (run payroll).
--
-- People Ops and Admin still hold workforce.write — they remain the
-- only non-Owner roles that can edit the HR module.

UPDATE workforce_roles
   SET permission_keys = (
         SELECT array_agg(pk ORDER BY pk)
         FROM unnest(permission_keys) AS pk
         WHERE pk <> 'workforce.write'
       ),
       updated_at = now()
 WHERE slug = 'finance'
   AND 'workforce.write' = ANY(permission_keys);

NOTIFY pgrst, 'reload schema';
