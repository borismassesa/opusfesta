-- Verify and setup messages system
-- Run this script to check if everything is set up correctly and create test data

-- 1. Check if message_threads table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_threads') THEN
    RAISE EXCEPTION 'message_threads table does not exist. Please run migration 022_messaging_system.sql first.';
  END IF;
  RAISE NOTICE '✓ message_threads table exists';
END $$;

-- 2. Check if messages table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    RAISE EXCEPTION 'messages table does not exist. Please run migration 022_messaging_system.sql first.';
  END IF;
  RAISE NOTICE '✓ messages table exists';
END $$;

-- 3. Check if trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_create_message_thread_on_inquiry'
  ) THEN
    RAISE WARNING 'Trigger for auto-creating message threads does not exist. Run migration 023_auto_create_message_thread_on_inquiry.sql';
  ELSE
    RAISE NOTICE '✓ Auto-create trigger exists';
  END IF;
END $$;

-- 4. Show current threads and messages count
SELECT 
  'Current Statistics' as info,
  (SELECT COUNT(*) FROM message_threads) as thread_count,
  (SELECT COUNT(*) FROM messages) as message_count,
  (SELECT COUNT(*) FROM vendors) as vendor_count,
  (SELECT COUNT(*) FROM users WHERE role = 'user') as user_count;

-- 5. Show existing threads (if any)
SELECT 
  'Existing Threads' as info,
  mt.id as thread_id,
  u.email as user_email,
  v.business_name as vendor_name,
  mt.last_message_at,
  (SELECT COUNT(*) FROM messages WHERE thread_id = mt.id) as message_count
FROM message_threads mt
JOIN users u ON mt.user_id = u.id
JOIN vendors v ON mt.vendor_id = v.id
ORDER BY mt.last_message_at DESC
LIMIT 10;

-- 6. Create test data if none exists
DO $$
DECLARE
  test_user_id UUID;
  test_vendor_id UUID;
  vendor_user_id UUID;
  thread_id UUID;
  existing_threads INTEGER;
BEGIN
  -- Count existing threads
  SELECT COUNT(*) INTO existing_threads FROM message_threads;
  
  IF existing_threads = 0 THEN
    RAISE NOTICE 'No threads found. Creating test data...';
    
    -- Get first user
    SELECT id INTO test_user_id
    FROM users
    WHERE role = 'user' OR role IS NULL
    LIMIT 1;

    -- Get first vendor
    SELECT id, user_id INTO test_vendor_id, vendor_user_id
    FROM vendors
    LIMIT 1;

    IF test_user_id IS NOT NULL AND test_vendor_id IS NOT NULL THEN
      -- Create first thread
      INSERT INTO message_threads (user_id, vendor_id, last_message_at, created_at, updated_at)
      VALUES (
        test_user_id,
        test_vendor_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
      )
      RETURNING id INTO thread_id;

      -- Create messages for first thread
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
          vendor_user_id,
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
          vendor_user_id,
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

      RAISE NOTICE '✓ Created test thread with 5 messages';
    ELSE
      RAISE WARNING 'Could not create test data: Need at least one user and one vendor in the database';
    END IF;
  ELSE
    RAISE NOTICE 'Threads already exist. Skipping test data creation.';
  END IF;
END $$;

-- 7. Final verification - show all threads
SELECT 
  'Final Thread List' as info,
  mt.id as thread_id,
  u.name as user_name,
  u.email as user_email,
  v.business_name as vendor_name,
  mt.last_message_at,
  (SELECT COUNT(*) FROM messages WHERE thread_id = mt.id) as message_count,
  (SELECT COUNT(*) FROM messages WHERE thread_id = mt.id AND read_at IS NULL) as unread_count
FROM message_threads mt
JOIN users u ON mt.user_id = u.id
JOIN vendors v ON mt.vendor_id = v.id
ORDER BY mt.last_message_at DESC;
