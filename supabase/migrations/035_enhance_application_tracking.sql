-- Enhance application tracking system with tasks, activity logs, and extended statuses
-- This migration adds comprehensive tracking capabilities for job applications

-- 1. Extend application_status enum with new statuses
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'phone_screen';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'technical_interview';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'final_interview';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'offer_extended';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'offer_accepted';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'offer_declined';

-- Note: PostgreSQL doesn't support removing enum values, so we keep all existing ones
-- Existing statuses: 'pending', 'reviewing', 'interviewed', 'rejected', 'hired'
-- New statuses: 'phone_screen', 'technical_interview', 'final_interview', 'offer_extended', 'offer_accepted', 'offer_declined'

-- 2. Create application_tasks table
CREATE TABLE IF NOT EXISTS application_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL, -- e.g., "review_resume", "schedule_interview", "send_offer"
  title TEXT NOT NULL, -- Human-readable task name
  completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for application_tasks
CREATE INDEX IF NOT EXISTS idx_application_tasks_application_id ON application_tasks(application_id);
CREATE INDEX IF NOT EXISTS idx_application_tasks_task_type ON application_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_application_tasks_completed ON application_tasks(completed);

-- Enable RLS on application_tasks
ALTER TABLE application_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_tasks
-- Admins can do everything
CREATE POLICY "admins manage application tasks" ON application_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 3. Create application_activity_log table
CREATE TABLE IF NOT EXISTS application_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- e.g., "status_changed", "note_added", "task_completed", "task_created"
  action_details JSONB, -- Flexible storage for action-specific data
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB -- Additional context
);

-- Create indexes for application_activity_log
CREATE INDEX IF NOT EXISTS idx_application_activity_log_application_id ON application_activity_log(application_id);
CREATE INDEX IF NOT EXISTS idx_application_activity_log_performed_at ON application_activity_log(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_activity_log_action_type ON application_activity_log(action_type);

-- Enable RLS on application_activity_log
ALTER TABLE application_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_activity_log
-- Admins can read all activity logs
CREATE POLICY "admins read activity logs" ON application_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can insert activity logs
CREATE POLICY "admins insert activity logs" ON application_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 4. Create function to get application counts per job posting
CREATE OR REPLACE FUNCTION get_job_application_counts()
RETURNS TABLE (
  job_posting_id UUID,
  application_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jp.id as job_posting_id,
    COALESCE(COUNT(ja.id), 0)::BIGINT as application_count
  FROM job_postings jp
  LEFT JOIN job_applications ja ON ja.job_posting_id = jp.id
  GROUP BY jp.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to update updated_at for application_tasks
CREATE TRIGGER update_application_tasks_updated_at
  BEFORE UPDATE ON application_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Create function to automatically log status changes
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
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
      auth.uid(),
      CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log status changes
DROP TRIGGER IF EXISTS trigger_log_status_change ON job_applications;
CREATE TRIGGER trigger_log_status_change
  AFTER UPDATE OF status ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION log_application_status_change();

-- 7. Create function to automatically log note changes
CREATE OR REPLACE FUNCTION log_application_note_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if notes actually changed
  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
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
      auth.uid(),
      CURRENT_TIMESTAMP
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log note changes
DROP TRIGGER IF EXISTS trigger_log_note_change ON job_applications;
CREATE TRIGGER trigger_log_note_change
  AFTER UPDATE OF notes ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION log_application_note_change();
