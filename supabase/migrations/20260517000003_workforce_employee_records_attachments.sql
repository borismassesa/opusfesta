-- =============================================================================
-- Workforce — employee records: file attachments
-- =============================================================================
-- Adds storage columns to workforce_employee_resume_entries and
-- workforce_employee_badges (which didn't have them in 20260517000002) and
-- a mime_type column to all four record tables so the UI can render the
-- right icon / open behaviour for each file type.
--
-- Files themselves land in the existing `employees` storage bucket
-- (created by migration 042) with the path convention
--   `{employee_id}/{record_kind}/{record_id}/{filename}`
-- where record_kind ∈ {resume, certification, badge, document}.
-- Server actions (record-actions.ts) use the service-role admin client
-- so bucket RLS is unaffected — the gate is requirePermission('workforce.write').

-- Resume entries — full file metadata (was attachment-less in 20260517000002)
ALTER TABLE workforce_employee_resume_entries
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS mime_type text;

-- Badges — full file metadata (some badges have a custom artwork JPEG/PNG)
ALTER TABLE workforce_employee_badges
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS mime_type text;

-- Certifications — only mime_type missing
ALTER TABLE workforce_employee_certifications
  ADD COLUMN IF NOT EXISTS mime_type text;

-- Documents — only mime_type missing
ALTER TABLE workforce_employee_documents
  ADD COLUMN IF NOT EXISTS mime_type text;

NOTIFY pgrst, 'reload schema';
