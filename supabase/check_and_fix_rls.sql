-- Check RLS policies and verify threads exist for your vendor
-- Run this to diagnose the issue

-- 1. Check if threads exist for your vendor (bypassing RLS with service role)
SELECT 
  'All Threads for Your Vendor (Admin View)' as info,
  mt.id as thread_id,
  mt.user_id as customer_user_id,
  mt.vendor_id,
  v.business_name,
  v.user_id as vendor_owner_id,
  u.email as customer_email
FROM message_threads mt
JOIN vendors v ON v.id = mt.vendor_id
JOIN users u ON u.id = mt.user_id
WHERE v.id = '9e0bc557-7ac4-44ef-b50e-6caea9e78fd7';

-- 2. Check RLS policies
SELECT 
  'RLS Policies Check' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('message_threads', 'messages')
ORDER BY tablename, policyname;

-- 3. Test the exact query the app uses (simulating auth.uid())
-- Note: This won't work in SQL Editor without auth, but shows the query structure
SELECT 
  'Query Structure Test' as info,
  mt.id,
  mt.vendor_id,
  mt.user_id,
  jsonb_build_object(
    'id', u.id,
    'name', u.name,
    'email', u.email,
    'avatar', u.avatar
  ) as user
FROM message_threads mt
JOIN users u ON u.id = mt.user_id
WHERE mt.vendor_id = '9e0bc557-7ac4-44ef-b50e-6caea9e78fd7'
ORDER BY mt.last_message_at DESC;

-- 4. Check if the vendor exists and user_id matches
SELECT 
  'Vendor Verification' as info,
  v.id as vendor_id,
  v.business_name,
  v.user_id as vendor_owner_user_id,
  'aed1cfce-d2a5-4173-9de5-8563380b6f61' as expected_user_id,
  (v.user_id = 'aed1cfce-d2a5-4173-9de5-8563380b6f61') as user_matches
FROM vendors v
WHERE v.id = '9e0bc557-7ac4-44ef-b50e-6caea9e78fd7';

-- 5. If no threads exist, create one now
DO $$
DECLARE
  your_vendor_id UUID := '9e0bc557-7ac4-44ef-b50e-6caea9e78fd7';
  your_user_id UUID := 'aed1cfce-d2a5-4173-9de5-8563380b6f61';
  test_user_id UUID;
  thread_id UUID;
  thread_count INTEGER;
BEGIN
  -- Count existing threads
  SELECT COUNT(*) INTO thread_count
  FROM message_threads
  WHERE vendor_id = your_vendor_id;

  RAISE NOTICE 'Existing threads for vendor: %', thread_count;

  IF thread_count = 0 THEN
    RAISE NOTICE 'No threads found. Creating test thread...';
    
    -- Get any other user (or use vendor owner for testing)
    SELECT id INTO test_user_id
    FROM users
    WHERE id != your_user_id
    LIMIT 1;

    IF test_user_id IS NULL THEN
      RAISE NOTICE 'No other users found, using vendor owner as customer (for testing)';
      test_user_id := your_user_id;
    END IF;

    -- Create thread
    INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
    VALUES (
      test_user_id,
      your_vendor_id,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      CURRENT_TIMESTAMP - INTERVAL '1 day'
    )
    RETURNING id INTO thread_id;

    RAISE NOTICE 'Created thread: %', thread_id;

    -- Create test messages
    INSERT INTO messages (thread_id, sender_id, content, created_at, updated_at)
    VALUES 
      (
        thread_id,
        test_user_id,
        'Hello! I''m interested in your services.',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
      ),
      (
        thread_id,
        your_user_id,
        'Thank you for your interest! How can I help you?',
        CURRENT_TIMESTAMP - INTERVAL '12 hours',
        CURRENT_TIMESTAMP - INTERVAL '12 hours'
      );

    RAISE NOTICE 'Created 2 test messages';
  ELSE
    RAISE NOTICE 'Threads already exist. Count: %', thread_count;
  END IF;
END $$;

-- 6. Final verification
SELECT 
  'Final Check' as info,
  COUNT(*) as thread_count,
  COUNT(DISTINCT mt.user_id) as unique_customers
FROM message_threads mt
WHERE mt.vendor_id = '9e0bc557-7ac4-44ef-b50e-6caea9e78fd7';
