-- Add image support to job_postings table
-- This allows job postings to have featured images

ALTER TABLE job_postings 
ADD COLUMN image_url TEXT,
ADD COLUMN featured_image_url TEXT;

-- Add index for faster queries if needed
CREATE INDEX IF NOT EXISTS idx_job_postings_image_url ON job_postings(image_url) WHERE image_url IS NOT NULL;
