-- Add is_archived field to job_postings table
-- This allows job postings to be archived for future reference while keeping them separate from active/inactive status

ALTER TABLE job_postings 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Create index for faster queries on archived status
CREATE INDEX IF NOT EXISTS idx_job_postings_is_archived ON job_postings(is_archived);

-- Add comment to clarify the field purpose
COMMENT ON COLUMN job_postings.is_archived IS 'Marks job postings as archived for future reference. Archived jobs are kept for reuse but are not displayed in active listings.';
