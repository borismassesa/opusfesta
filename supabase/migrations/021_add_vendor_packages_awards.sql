-- Add packages and awards JSONB fields to vendors table
-- These fields store vendor pricing packages and awards/recognitions

ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS packages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS awards JSONB DEFAULT '[]'::jsonb;

-- Add GIN indexes for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_vendors_packages ON vendors USING GIN (packages);
CREATE INDEX IF NOT EXISTS idx_vendors_awards ON vendors USING GIN (awards);

-- Add comment for documentation
COMMENT ON COLUMN vendors.packages IS 'Array of pricing packages offered by the vendor';
COMMENT ON COLUMN vendors.awards IS 'Array of awards and recognitions received by the vendor';
