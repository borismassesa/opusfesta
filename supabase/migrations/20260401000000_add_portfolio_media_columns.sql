ALTER TABLE studio_projects 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb;
