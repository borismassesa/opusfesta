-- Fix messages: Update test threads to use a specific user
-- Replace 'YOUR_USER_ID' with the actual logged-in user's ID from the vendor portal

-- First, find out which user owns the vendor
SELECT 
  'Vendor Owner Info' as info,
  v.id as vendor_id,
  v.business_name,
  v.user_id as vendor_owner_user_id,
  u.email as vendor_owner_email
FROM vendors v
JOIN users u ON u.id = v.user_id
WHERE v.business_name = 'Sea Cliff Hotel & Resort';

-- Option 1: Update existing threads to use a different user
-- (If you want to test with a specific user)
-- Replace 'TARGET_USER_ID' with the user ID you want to test with
/*
UPDATE message_threads
SET user_id = 'TARGET_USER_ID'
WHERE vendor_id = 'b0000001-0001-4001-8001-000000000001';
*/

-- Option 2: Create new threads for the vendor owner to test
-- This creates threads where the vendor owner is both the vendor AND the customer (for testing)
DO $$
DECLARE
  vendor_owner_id UUID := 'a0000001-0001-4001-8001-000000000001';
  vendor_id UUID := 'b0000001-0001-4001-8001-000000000001';
  test_user_id UUID;
  thread_id UUID;
BEGIN
  -- Get a different user (not the vendor owner) to create a thread
  SELECT id INTO test_user_id
  FROM users
  WHERE id != vendor_owner_id
  LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    -- Create a thread with a different user
    INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
    VALUES (
      test_user_id,
      vendor_id,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      CURRENT_TIMESTAMP - INTERVAL '1 day'
    )
    ON CONFLICT (user_id, vendor_id) DO NOTHING
    RETURNING id INTO thread_id;

    -- If thread was created, add a test message
    IF thread_id IS NOT NULL THEN
      INSERT INTO messages (thread_id, sender_id, content, created_at, updated_at)
      VALUES (
        thread_id,
        test_user_id,
        'Hello! I''m interested in your services.',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
      );
      
      RAISE NOTICE 'Created test thread with ID: %', thread_id;
    ELSE
      RAISE NOTICE 'Thread already exists or could not be created';
    END IF;
  ELSE
    RAISE NOTICE 'No other users found to create test thread';
  END IF;
END $$;

-- Verify the threads are accessible
-- Run this while authenticated as the vendor owner (a0000001-0001-4001-8001-000000000001)
SELECT 
  'Verification' as info,
  mt.id as thread_id,
  mt.user_id as customer_user_id,
  u.email as customer_email,
  mt.vendor_id,
  v.business_name,
  v.user_id as vendor_owner_id,
  (v.user_id = auth.uid()) as should_be_visible
FROM message_threads mt
JOIN vendors v ON v.id = mt.vendor_id
JOIN users u ON u.id = mt.user_id
WHERE v.id = 'b0000001-0001-4001-8001-000000000001';
