-- Add cover_letter_url field to job_applications table
-- This allows applicants to upload a cover letter file in addition to or instead of typing it

ALTER TABLE job_applications 
ADD COLUMN cover_letter_url TEXT;

-- Make cover_letter optional since users can now upload a file instead
ALTER TABLE job_applications 
ALTER COLUMN cover_letter DROP NOT NULL;

-- Add a check constraint to ensure at least one of cover_letter or cover_letter_url is provided
ALTER TABLE job_applications
ADD CONSTRAINT check_cover_letter_provided 
CHECK (
  (cover_letter IS NOT NULL AND cover_letter != '') OR 
  (cover_letter_url IS NOT NULL AND cover_letter_url != '')
);
