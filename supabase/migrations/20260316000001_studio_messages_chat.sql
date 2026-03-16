-- ============================================================================
-- Studio Messages Chat Enhancement
-- Adds sender_type, sender_name, sender_client_id, read_at for client↔admin chat
-- ============================================================================

-- Add new columns
ALTER TABLE studio_messages
  ADD COLUMN IF NOT EXISTS sender_type text NOT NULL DEFAULT 'admin'
    CHECK (sender_type IN ('admin', 'client')),
  ADD COLUMN IF NOT EXISTS sender_name text,
  ADD COLUMN IF NOT EXISTS sender_client_id uuid REFERENCES studio_client_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill sender_type from existing sender column
UPDATE studio_messages
SET sender_type = CASE
  WHEN sender IN ('admin', 'client') THEN sender
  ELSE 'admin'
END,
updated_at = COALESCE(created_at, now())
WHERE sender_type = 'admin' AND sender IS NOT NULL;

-- Index for fast unread queries (admin checking unread client messages)
CREATE INDEX IF NOT EXISTS idx_studio_messages_unread_client
  ON studio_messages(booking_id, sender_type)
  WHERE read_at IS NULL;

-- Index for fast unread queries (client checking unread admin messages)
CREATE INDEX IF NOT EXISTS idx_studio_messages_unread_admin
  ON studio_messages(booking_id, sender_type)
  WHERE read_at IS NULL;

-- Index for client profile lookup
CREATE INDEX IF NOT EXISTS idx_studio_messages_sender_client
  ON studio_messages(sender_client_id)
  WHERE sender_client_id IS NOT NULL;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_studio_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_studio_messages_updated_at ON studio_messages;
CREATE TRIGGER trg_studio_messages_updated_at
  BEFORE UPDATE ON studio_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_studio_messages_updated_at();
