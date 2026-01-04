-- Create test messages for your specific vendor
-- Replace these IDs with your actual IDs from the console logs

DO $$
DECLARE
  your_vendor_id UUID := '9e0bc557-7ac4-44ef-b50e-6caea9e78fd7';  -- Your vendor ID from console
  your_user_id UUID := 'aed1cfce-d2a5-4173-9de5-8563380b6f61';     -- Your user ID from console
  test_user_id UUID;
  thread_id UUID;
BEGIN
  RAISE NOTICE 'Creating messages for vendor: %', your_vendor_id;
  RAISE NOTICE 'Vendor owner user ID: %', your_user_id;

  -- Get a different user to create a conversation with
  SELECT id INTO test_user_id
  FROM users
  WHERE id != your_user_id
  LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No other users found. Will create thread with vendor owner as customer (for testing)';
    test_user_id := your_user_id;
  ELSE
    RAISE NOTICE 'Using test user: %', test_user_id;
  END IF;

  -- Create first thread
  INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
  VALUES (
    test_user_id,
    your_vendor_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  )
  ON CONFLICT (user_id, vendor_id) DO UPDATE
  SET last_message_at = CURRENT_TIMESTAMP
  RETURNING id INTO thread_id;

  IF thread_id IS NULL THEN
    -- Get existing thread
    SELECT id INTO thread_id
    FROM message_threads
    WHERE user_id = test_user_id
      AND vendor_id = your_vendor_id
    LIMIT 1;
  END IF;

  -- Only add messages if thread exists and doesn't have messages yet
  IF thread_id IS NOT NULL THEN
    -- Check if thread already has messages
    IF NOT EXISTS (SELECT 1 FROM messages WHERE messages.thread_id = thread_id LIMIT 1) THEN
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
          your_user_id,
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
          your_user_id,
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
      RAISE NOTICE 'Thread already has messages, skipping';
    END IF;
  END IF;

  -- Try to create a second thread with a different user
  SELECT id INTO test_user_id
  FROM users
  WHERE id != your_user_id
    AND id != test_user_id
  LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
    VALUES (
      test_user_id,
      your_vendor_id,
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
          your_user_id,
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

  RAISE NOTICE 'Done! Refresh your messages page.';
END $$;

-- Verify what was created
SELECT 
  'Your Threads' as info,
  mt.id as thread_id,
  u.email as customer_email,
  u.name as customer_name,
  v.business_name as vendor_name,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM message_threads mt
JOIN users u ON mt.user_id = u.id
JOIN vendors v ON mt.vendor_id = v.id
LEFT JOIN messages m ON m.thread_id = mt.id
WHERE v.id = '9e0bc557-7ac4-44ef-b50e-6caea9e78fd7'
GROUP BY mt.id, u.email, u.name, v.business_name
ORDER BY last_message_at DESC;
