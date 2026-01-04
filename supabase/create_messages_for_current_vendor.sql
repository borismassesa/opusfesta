-- Create test messages for the currently logged-in vendor
-- This script will create threads and messages for YOUR vendor

DO $$
DECLARE
  current_vendor_id UUID;
  current_vendor_user_id UUID;
  test_user_id UUID;
  thread_id UUID;
BEGIN
  -- Get the vendor for the current authenticated user
  SELECT id, user_id INTO current_vendor_id, current_vendor_user_id
  FROM vendors
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF current_vendor_id IS NULL THEN
    RAISE NOTICE 'No vendor found for current user. User ID: %', auth.uid();
    RETURN;
  END IF;

  RAISE NOTICE 'Found vendor: % (ID: %)', current_vendor_id, current_vendor_user_id;

  -- Get a different user to create a conversation with
  -- Try to find a user that's not the vendor owner
  SELECT id INTO test_user_id
  FROM users
  WHERE id != current_vendor_user_id
  LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No other users found. Creating thread with vendor owner as customer (for testing)';
    -- For testing, we can create a thread where the vendor owner is also the customer
    test_user_id := current_vendor_user_id;
  END IF;

  -- Create first thread
  INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
  VALUES (
    test_user_id,
    current_vendor_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  )
  ON CONFLICT (user_id, vendor_id) DO NOTHING
  RETURNING id INTO thread_id;

  -- If thread was created, add messages
  IF thread_id IS NOT NULL THEN
    RAISE NOTICE 'Created thread: %', thread_id;
    
    -- Create messages
    INSERT INTO messages (thread_id, sender_id, content, created_at, updated_at)
    VALUES 
      (
        thread_id,
        test_user_id,
        'Hi! I''m interested in booking your services for my wedding. Could you tell me more about your packages?',
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
      ),
      (
        thread_id,
        current_vendor_user_id,
        'Thank you for your interest! I''d be happy to help you plan your special day. We have several packages available. Would you like to schedule a consultation?',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
      ),
      (
        thread_id,
        test_user_id,
        'That sounds great! What dates do you have available in March?',
        CURRENT_TIMESTAMP - INTERVAL '12 hours',
        CURRENT_TIMESTAMP - INTERVAL '12 hours'
      ),
      (
        thread_id,
        current_vendor_user_id,
        'I have availability on March 15th, 22nd, and 29th. Which date works best for you?',
        CURRENT_TIMESTAMP - INTERVAL '6 hours',
        CURRENT_TIMESTAMP - INTERVAL '6 hours'
      ),
      (
        thread_id,
        test_user_id,
        'March 22nd would be perfect! Can you send me a quote?',
        CURRENT_TIMESTAMP - INTERVAL '1 hour',
        CURRENT_TIMESTAMP - INTERVAL '1 hour'
      );

    RAISE NOTICE 'Created 5 messages for thread: %', thread_id;
  ELSE
    RAISE NOTICE 'Thread already exists or could not be created';
    -- Get existing thread ID
    SELECT id INTO thread_id
    FROM message_threads
    WHERE user_id = test_user_id
      AND vendor_id = current_vendor_id
    LIMIT 1;
  END IF;

  -- Create second thread with a different user (if available)
  SELECT id INTO test_user_id
  FROM users
  WHERE id != current_vendor_user_id
    AND id != test_user_id
  LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
    VALUES (
      test_user_id,
      current_vendor_id,
      CURRENT_TIMESTAMP - INTERVAL '1 day',
      CURRENT_TIMESTAMP - INTERVAL '3 days',
      CURRENT_TIMESTAMP - INTERVAL '3 days'
    )
    ON CONFLICT (user_id, vendor_id) DO NOTHING
    RETURNING id INTO thread_id;

    IF thread_id IS NOT NULL THEN
      INSERT INTO messages (thread_id, sender_id, content, created_at, updated_at)
      VALUES 
        (
          thread_id,
          test_user_id,
          'Hello! I saw your portfolio and I''m very impressed. Are you available for a birthday party in April?',
          CURRENT_TIMESTAMP - INTERVAL '3 days',
          CURRENT_TIMESTAMP - INTERVAL '3 days'
        ),
        (
          thread_id,
          current_vendor_user_id,
          'Thank you! Yes, I have availability in April. What date are you looking at?',
          CURRENT_TIMESTAMP - INTERVAL '2 days',
          CURRENT_TIMESTAMP - INTERVAL '2 days'
        ),
        (
          thread_id,
          test_user_id,
          'April 10th would be ideal. How many guests can you accommodate?',
          CURRENT_TIMESTAMP - INTERVAL '1 day',
          CURRENT_TIMESTAMP - INTERVAL '1 day'
        );

      RAISE NOTICE 'Created second thread: % with 3 messages', thread_id;
    END IF;
  END IF;

  RAISE NOTICE 'Done! Check your messages page now.';
END $$;

-- Verify what was created
SELECT 
  'Created Threads' as info,
  mt.id as thread_id,
  u.email as customer_email,
  v.business_name as vendor_name,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM message_threads mt
JOIN users u ON mt.user_id = u.id
JOIN vendors v ON mt.vendor_id = v.id
LEFT JOIN messages m ON m.thread_id = mt.id
WHERE v.user_id = auth.uid()
GROUP BY mt.id, u.email, v.business_name
ORDER BY last_message_at DESC;
