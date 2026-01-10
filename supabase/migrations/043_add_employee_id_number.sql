-- Add employee ID number field to employees table
-- This migration adds an employee_id field for organization-specific employee identification

ALTER TABLE employees 
ADD COLUMN employee_id TEXT;

-- Create unique index on employee_id to ensure uniqueness
CREATE UNIQUE INDEX idx_employees_employee_id ON employees(employee_id) WHERE employee_id IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX idx_employees_employee_id_lookup ON employees(employee_id);
