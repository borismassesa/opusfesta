-- Fix activity log triggers to capture user ID when using admin client
-- When using admin client (service role), auth.uid() is NULL, so we use a session variable

-- Update function to log status changes - use session variable if auth.uid() is NULL
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Try to get user ID from auth context first, fallback to session variable
    BEGIN
      user_id := COALESCE(
        auth.uid(),
        NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
      );
    EXCEPTION WHEN OTHERS THEN
      -- If session variable doesn't exist, use NULL
      user_id := COALESCE(auth.uid(), NULL);
    END;
    
    INSERT INTO application_activity_log (
      application_id,
      action_type,
      action_details,
      performed_by,
      performed_at
    ) VALUES (
      NEW.id,
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      ),
      user_id,
      CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update function to log note changes - use session variable if auth.uid() is NULL
CREATE OR REPLACE FUNCTION log_application_note_change()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Only log if notes actually changed
  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
    -- Try to get user ID from auth context first, fallback to session variable
    BEGIN
      user_id := COALESCE(
        auth.uid(),
        NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID
      );
    EXCEPTION WHEN OTHERS THEN
      -- If session variable doesn't exist, use NULL
      user_id := COALESCE(auth.uid(), NULL);
    END;
    
    INSERT INTO application_activity_log (
      application_id,
      action_type,
      action_details,
      performed_by,
      performed_at
    ) VALUES (
      NEW.id,
      'note_added',
      jsonb_build_object(
        'old_notes', OLD.notes,
        'new_notes', NEW.notes,
        'has_notes', NEW.notes IS NOT NULL AND NEW.notes != ''
      ),
      user_id,
      CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update application with user context
-- This function sets the session variable and performs the update
-- p_update_data is a JSONB object with optional 'status' and 'notes' fields
-- If a field is not present in the JSONB, it won't be updated
CREATE OR REPLACE FUNCTION update_application_with_user_context(
  p_application_id UUID,
  p_user_id UUID,
  p_update_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  result_record RECORD;
BEGIN
  -- Set session variable for triggers to use
  PERFORM set_config('app.current_user_id', p_user_id::TEXT, FALSE);
  
  -- Perform update - only update fields that are present in p_update_data
  UPDATE job_applications
  SET
    status = CASE 
      WHEN p_update_data ? 'status' THEN (p_update_data->>'status')::application_status
      ELSE status
    END,
    notes = CASE 
      WHEN p_update_data ? 'notes' THEN p_update_data->>'notes'
      ELSE notes
    END
  WHERE id = p_application_id
  RETURNING * INTO result_record;
  
  -- Return updated record as JSONB
  RETURN row_to_json(result_record)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;