-- Migration: Remove Timesheet System
-- Description: Drops timesheet/integration schema objects and employee fields added for timesheet workflows
-- Date: 2026-02-15

-- Drop analytics materialized views first
DROP MATERIALIZED VIEW IF EXISTS timesheet_summary_by_week CASCADE;
DROP MATERIALIZED VIEW IF EXISTS department_summary_by_week CASCADE;
DROP MATERIALIZED VIEW IF EXISTS project_hours_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS employee_utilization_summary CASCADE;

-- Drop analytics/reporting/helper functions
DROP FUNCTION IF EXISTS refresh_timesheet_analytics() CASCADE;
DROP FUNCTION IF EXISTS get_employee_hours_report(UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_department_hours_report(TEXT, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_project_hours_breakdown(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_employee_utilization(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_manager_pending_approvals_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS can_approve_timesheet(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_manager_of(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_timesheet_status_on_approval() CASCADE;
DROP FUNCTION IF EXISTS create_approval_records() CASCADE;
DROP FUNCTION IF EXISTS recalculate_timesheet_hours() CASCADE;
DROP FUNCTION IF EXISTS validate_entry_date() CASCADE;
DROP FUNCTION IF EXISTS get_employee_managers(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_manager_reports(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_holiday(DATE) CASCADE;
DROP FUNCTION IF EXISTS get_active_projects() CASCADE;
DROP FUNCTION IF EXISTS get_employee_projects(UUID) CASCADE;

-- Drop timesheet/integration tables
DROP TABLE IF EXISTS timesheet_approvals CASCADE;
DROP TABLE IF EXISTS timesheet_entries CASCADE;
DROP TABLE IF EXISTS timesheets CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS project_assignments CASCADE;
DROP TABLE IF EXISTS payroll_exports CASCADE;
DROP TABLE IF EXISTS company_holidays CASCADE;
DROP TABLE IF EXISTS integration_sync_logs CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS employee_managers CASCADE;

-- Drop timesheet enum type
DROP TYPE IF EXISTS timesheet_status;

-- Remove employee fields introduced for timesheet workflows
ALTER TABLE employees
  DROP COLUMN IF EXISTS employee_number,
  DROP COLUMN IF EXISTS department,
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS hourly_rate,
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS employment_type,
  DROP COLUMN IF EXISTS default_hours_per_week;
