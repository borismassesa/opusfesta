-- Auto-create message thread when inquiry is created
-- This migration adds a function and trigger to automatically create
-- a message thread and initial message when a new inquiry is submitted

-- Function to create message thread and initial message when inquiry is created
CREATE OR REPLACE FUNCTION create_message_thread_from_inquiry()
RETURNS TRIGGER AS $$
DECLARE
  thread_id UUID;
  vendor_user_id UUID;
BEGIN
  -- Get the vendor's user_id
  SELECT user_id INTO vendor_user_id
  FROM vendors
  WHERE id = NEW.vendor_id;

  -- Only create thread if inquiry has a user_id (authenticated user)
  IF NEW.user_id IS NOT NULL AND vendor_user_id IS NOT NULL THEN
    -- Check if thread already exists
    SELECT id INTO thread_id
    FROM message_threads
    WHERE user_id = NEW.user_id
      AND vendor_id = NEW.vendor_id
    LIMIT 1;

    -- Create thread if it doesn't exist
    IF thread_id IS NULL THEN
      INSERT INTO message_threads (user_id, vendor_id, last_message_at)
      VALUES (NEW.user_id, NEW.vendor_id, CURRENT_TIMESTAMP)
      RETURNING id INTO thread_id;
    END IF;

    -- Create initial message from the inquiry
    INSERT INTO messages (thread_id, sender_id, content, created_at)
    VALUES (
      thread_id,
      NEW.user_id,
      COALESCE(
        NEW.message,
        'I''m interested in booking your services for my ' || NEW.event_type || ' event.'
      ),
      NEW.created_at
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function when inquiry is created
CREATE TRIGGER trigger_create_message_thread_on_inquiry
  AFTER INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION create_message_thread_from_inquiry();

-- Add comment for documentation
COMMENT ON FUNCTION create_message_thread_from_inquiry() IS 'Automatically creates a message thread and initial message when a new inquiry is submitted';
