-- Create test message data for development/testing
-- This script creates sample conversations between users and vendors

-- First, let's get some existing users and vendors
-- Note: Adjust these UUIDs based on your actual data

-- Create test message threads and messages
-- This assumes you have at least one user and one vendor in your database

DO $$
DECLARE
  test_user_id UUID;
  test_vendor_id UUID;
  vendor_user_id UUID;
  thread_id UUID;
  message_id UUID;
BEGIN
  -- Get first user (adjust query as needed)
  SELECT id INTO test_user_id
  FROM users
  WHERE role = 'user'
  LIMIT 1;

  -- Get first vendor
  SELECT id, user_id INTO test_vendor_id, vendor_user_id
  FROM vendors
  LIMIT 1;

  -- Only proceed if we have both user and vendor
  IF test_user_id IS NOT NULL AND test_vendor_id IS NOT NULL THEN
    -- Create a message thread
    INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
    VALUES (
      test_user_id,
      test_vendor_id,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP - INTERVAL '2 days',
      CURRENT_TIMESTAMP - INTERVAL '2 days'
    )
    ON CONFLICT (user_id, vendor_id) DO NOTHING
    RETURNING id INTO thread_id;

    -- If thread was created, get its ID, otherwise get existing thread
    IF thread_id IS NULL THEN
      SELECT id INTO thread_id
      FROM message_threads
      WHERE user_id = test_user_id
        AND vendor_id = test_vendor_id
      LIMIT 1;
    END IF;

    -- Create initial message from user (2 days ago)
    IF thread_id IS NOT NULL THEN
      INSERT INTO messages (thread_id, sender_id, content, created_at, updated_at)
      VALUES (
        thread_id,
        test_user_id,
        'Hi! I''m interested in booking your services for my wedding. Could you tell me more about your packages?',
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
      )
      RETURNING id INTO message_id;

      -- Vendor response (1 day ago)
      INSERT INTO messages (thread_id, sender_id, content, read_at, created_at, updated_at)
      VALUES (
        thread_id,
        vendor_user_id,
        'Thank you for your interest! I''d be happy to help you plan your special day. We have several packages available. Would you like to schedule a consultation?',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
      );

      -- User follow-up (12 hours ago)
      INSERT INTO messages (thread_id, sender_id, content, read_at, created_at, updated_at)
      VALUES (
        thread_id,
        test_user_id,
        'That sounds great! What dates do you have available in March?',
        CURRENT_TIMESTAMP - INTERVAL '12 hours',
        CURRENT_TIMESTAMP - INTERVAL '12 hours',
        CURRENT_TIMESTAMP - INTERVAL '12 hours'
      );

      -- Vendor response (6 hours ago)
      INSERT INTO messages (thread_id, sender_id, content, read_at, created_at, updated_at)
      VALUES (
        thread_id,
        vendor_user_id,
        'I have availability on March 15th, 22nd, and 29th. Which date works best for you?',
        CURRENT_TIMESTAMP - INTERVAL '6 hours',
        CURRENT_TIMESTAMP - INTERVAL '6 hours',
        CURRENT_TIMESTAMP - INTERVAL '6 hours'
      );

      -- User response (1 hour ago) - unread
      INSERT INTO messages (thread_id, sender_id, content, created_at, updated_at)
      VALUES (
        thread_id,
        test_user_id,
        'March 22nd would be perfect! Can you send me a quote?',
        CURRENT_TIMESTAMP - INTERVAL '1 hour',
        CURRENT_TIMESTAMP - INTERVAL '1 hour'
      );
    END IF;

    -- Create another thread with a different user (if available)
    SELECT id INTO test_user_id
    FROM users
    WHERE role = 'user'
      AND id != test_user_id
    LIMIT 1;

    IF test_user_id IS NOT NULL THEN
      -- Create second thread
      INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
      VALUES (
        test_user_id,
        test_vendor_id,
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP - INTERVAL '3 days'
      )
      ON CONFLICT (user_id, vendor_id) DO NOTHING
      RETURNING id INTO thread_id;

      IF thread_id IS NULL THEN
        SELECT id INTO thread_id
        FROM message_threads
        WHERE user_id = test_user_id
          AND vendor_id = test_vendor_id
        LIMIT 1;
      END IF;

      -- Create messages for second thread
      IF thread_id IS NOT NULL THEN
        INSERT INTO messages (thread_id, sender_id, content, read_at, created_at, updated_at)
        VALUES (
          thread_id,
          test_user_id,
          'Hello! I saw your portfolio and I''m very impressed. Are you available for a birthday party in April?',
          CURRENT_TIMESTAMP - INTERVAL '1 day',
          CURRENT_TIMESTAMP - INTERVAL '3 days',
          CURRENT_TIMESTAMP - INTERVAL '3 days'
        );

        INSERT INTO messages (thread_id, sender_id, content, read_at, created_at, updated_at)
        VALUES (
          thread_id,
          vendor_user_id,
          'Thank you! Yes, I have availability in April. What date are you looking at?',
          CURRENT_TIMESTAMP - INTERVAL '1 day',
          CURRENT_TIMESTAMP - INTERVAL '2 days',
          CURRENT_TIMESTAMP - INTERVAL '2 days'
        );

        INSERT INTO messages (thread_id, sender_id, content, created_at, updated_at)
        VALUES (
          thread_id,
          test_user_id,
          'April 10th would be ideal. How many guests can you accommodate?',
          CURRENT_TIMESTAMP - INTERVAL '1 day',
          CURRENT_TIMESTAMP - INTERVAL '1 day'
        );
      END IF;
    END IF;

    RAISE NOTICE 'Test messages created successfully!';
  ELSE
    RAISE NOTICE 'Could not create test messages: Missing user or vendor data';
  END IF;
END $$;

-- Display created threads and messages
SELECT 
  mt.id as thread_id,
  u.name as user_name,
  u.email as user_email,
  v.business_name as vendor_name,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM message_threads mt
JOIN users u ON mt.user_id = u.id
JOIN vendors v ON mt.vendor_id = v.id
LEFT JOIN messages m ON m.thread_id = mt.id
GROUP BY mt.id, u.name, u.email, v.business_name
ORDER BY last_message_at DESC;
