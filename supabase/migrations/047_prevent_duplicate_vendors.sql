-- Migration: Prevent Duplicate Vendors
-- This migration adds a unique constraint on user_id to ensure each user can only have one vendor profile
-- It also normalizes contact_info emails to lowercase

-- Step 1: Clean up any existing duplicate vendors (keep the oldest one per user)
DO $$
DECLARE
  duplicate_record RECORD;
  keep_vendor_id UUID;
BEGIN
  -- Find users with multiple vendors
  FOR duplicate_record IN
    SELECT user_id, COUNT(*) as vendor_count
    FROM vendors
    GROUP BY user_id
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the oldest vendor (by created_at)
    SELECT id INTO keep_vendor_id
    FROM vendors
    WHERE user_id = duplicate_record.user_id
    ORDER BY created_at ASC
    LIMIT 1;

    -- Delete other vendors for this user
    DELETE FROM vendors
    WHERE user_id = duplicate_record.user_id
      AND id != keep_vendor_id;

    RAISE NOTICE 'Removed duplicate vendors for user %, kept vendor %', duplicate_record.user_id, keep_vendor_id;
  END LOOP;
END $$;

-- Step 2: Normalize contact_info emails to lowercase
UPDATE vendors
SET contact_info = jsonb_set(
  contact_info,
  '{email}',
  to_jsonb(LOWER(contact_info->>'email'))
)
WHERE contact_info->>'email' IS NOT NULL
  AND contact_info->>'email' != LOWER(contact_info->>'email');

-- Step 3: Add unique constraint on user_id
-- This ensures each user can only have one vendor profile
ALTER TABLE vendors
ADD CONSTRAINT unique_vendor_per_user UNIQUE (user_id);

-- Step 4: Create index for faster lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_vendors_user_id_unique ON vendors(user_id);
