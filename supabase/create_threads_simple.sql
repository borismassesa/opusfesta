-- Simple script to create threads for your vendor
-- This will definitely create threads if they don't exist

DO $$
DECLARE
  v_vendor_id UUID := '9e0bc557-7ac4-44ef-b50e-6caea9e78fd7';
  v_vendor_user_id UUID := 'aed1cfce-d2a5-4173-9de5-8563380b6f61';
  existing_count INTEGER;
  test_user_id UUID;
  v_thread_id UUID;
BEGIN
  -- First, check what exists
  SELECT COUNT(*) INTO existing_count
  FROM message_threads
  WHERE message_threads.vendor_id = v_vendor_id;
  
  RAISE NOTICE 'Existing threads for vendor: %', existing_count;

  -- Find any user that's not the vendor owner
  SELECT id INTO test_user_id
  FROM users
  WHERE id != v_vendor_user_id
  LIMIT 1;

  -- If no other user, use vendor owner (for testing purposes)
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No other users found. Using vendor owner as customer for testing.';
    test_user_id := v_vendor_user_id;
  END IF;

  RAISE NOTICE 'Using test user: %', test_user_id;

  -- Create thread (will update if exists)
  INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
  VALUES (
    test_user_id,
    v_vendor_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
  )
  ON CONFLICT (user_id, vendor_id) 
  DO UPDATE SET last_message_at = CURRENT_TIMESTAMP
  RETURNING id INTO v_thread_id;

  RAISE NOTICE 'Thread ID: %', v_thread_id;

  -- Get the thread ID (in case it already existed)
  IF v_thread_id IS NULL THEN
    SELECT id INTO v_thread_id
    FROM message_threads
    WHERE user_id = test_user_id
      AND vendor_id = v_vendor_id;
  END IF;

  -- Create messages only if thread doesn't have any
  IF v_thread_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM messages WHERE messages.thread_id = v_thread_id LIMIT 1
  ) THEN
    INSERT INTO messages (thread_id, sender_id, content, created_at, updated_at)
    VALUES 
      (
        v_thread_id,
        test_user_id,
        'Hi! I''m interested in booking your services. Can you tell me more?',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
      ),
      (
        v_thread_id,
        v_vendor_user_id,
        'Thank you for your interest! I''d be happy to help. What type of event are you planning?',
        CURRENT_TIMESTAMP - INTERVAL '12 hours',
        CURRENT_TIMESTAMP - INTERVAL '12 hours'
      ),
      (
        v_thread_id,
        test_user_id,
        'It''s for a wedding in March. What dates do you have available?',
        CURRENT_TIMESTAMP - INTERVAL '6 hours',
        CURRENT_TIMESTAMP - INTERVAL '6 hours'
      );

    RAISE NOTICE 'Created 3 messages for thread: %', v_thread_id;
  ELSE
    RAISE NOTICE 'Thread already has messages or thread_id is null';
  END IF;
END $$;

-- Verify what was created
SELECT 
  'Verification' as info,
  mt.id as thread_id,
  u.email as customer_email,
  u.name as customer_name,
  v.business_name,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message
FROM message_threads mt
JOIN users u ON u.id = mt.user_id
JOIN vendors v ON v.id = mt.vendor_id
LEFT JOIN messages m ON m.thread_id = mt.id
WHERE mt.vendor_id = '9e0bc557-7ac4-44ef-b50e-6caea9e78fd7'
GROUP BY mt.id, u.email, u.name, v.business_name;
