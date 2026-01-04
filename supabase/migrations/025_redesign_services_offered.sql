-- Migration: Redesign services_offered to support title and description
-- Changes services_offered from TEXT[] to JSONB to store objects with title and description

-- Step 1: Add a temporary column for the new structure
ALTER TABLE vendors 
ADD COLUMN services_offered_new JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data from TEXT[] to JSONB format
-- Convert each string in the array to an object with title (the string) and empty description
UPDATE vendors
SET services_offered_new = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'title', service,
        'description', ''
      )
    ),
    '[]'::jsonb
  )
  FROM unnest(COALESCE(services_offered, ARRAY[]::text[])) AS service
)
WHERE services_offered IS NOT NULL;

-- Handle NULL or empty arrays - set to empty JSONB array
UPDATE vendors
SET services_offered_new = '[]'::jsonb
WHERE services_offered IS NULL OR array_length(services_offered, 1) IS NULL;

-- Step 3: Drop the old column
ALTER TABLE vendors DROP COLUMN services_offered;

-- Step 4: Rename the new column to the original name
ALTER TABLE vendors RENAME COLUMN services_offered_new TO services_offered;

-- Step 5: Add a check constraint to ensure the JSONB structure is correct
ALTER TABLE vendors 
ADD CONSTRAINT services_offered_structure_check 
CHECK (
  services_offered IS NULL OR
  (
    jsonb_typeof(services_offered) = 'array' AND
    (
      jsonb_array_length(services_offered) = 0 OR
      (
        SELECT bool_and(
          jsonb_typeof(elem) = 'object' AND
          elem ? 'title' AND
          jsonb_typeof(elem->'title') = 'string' AND
          (NOT (elem ? 'description') OR jsonb_typeof(elem->'description') = 'string')
        )
        FROM jsonb_array_elements(services_offered) AS elem
      )
    )
  )
);

-- Add comment to document the structure
COMMENT ON COLUMN vendors.services_offered IS 'Array of service objects, each with "title" (string) and "description" (string) fields';
