-- Add fields for the new job description template format
-- This migration adds all the sections required by the new template

ALTER TABLE job_postings 
ADD COLUMN IF NOT EXISTS about_thefesta TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS growth_description TEXT,
ADD COLUMN IF NOT EXISTS hiring_process TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS how_to_apply TEXT,
ADD COLUMN IF NOT EXISTS equal_opportunity_statement TEXT;

-- Set default values for new fields if they don't exist
UPDATE job_postings
SET 
  about_thefesta = COALESCE(about_thefesta, 'At TheFesta, we build meaningful experiences and solutions that bring people, businesses, and communities together. We are a growing, people-first company driven by creativity, collaboration, and a passion for excellence. Our culture is built on trust, ownership, and continuous learning—where every voice matters and every team member has the opportunity to grow.'),
  benefits = COALESCE(benefits, ARRAY[]::TEXT[]),
  growth_description = COALESCE(growth_description, 'At TheFesta, we believe in investing in our people. You''ll have opportunities to learn new skills, take on new challenges, and grow your career alongside a talented and motivated team.'),
  hiring_process = COALESCE(hiring_process, ARRAY['Application review', 'Initial conversation with our team', 'Role-specific interview', 'Final discussion and offer']::TEXT[]),
  how_to_apply = COALESCE(how_to_apply, 'If you''re excited about this opportunity and believe you''d be a great fit for TheFesta, we''d love to hear from you. 👉 Apply by submitting your resume through our careers page.'),
  equal_opportunity_statement = COALESCE(equal_opportunity_statement, 'TheFesta is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.')
WHERE about_thefesta IS NULL 
   OR growth_description IS NULL 
   OR how_to_apply IS NULL 
   OR equal_opportunity_statement IS NULL;
