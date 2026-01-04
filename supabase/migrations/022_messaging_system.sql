-- Messaging System - Message Threads and Messages
-- This migration creates tables for vendor-customer messaging functionality

-- Message Threads Table
-- Stores conversation threads between users and vendors
CREATE TABLE IF NOT EXISTS message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, vendor_id)
);

-- Messages Table
-- Stores individual messages within threads
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_message_threads_user_id ON message_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_vendor_id ON message_threads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message_at ON message_threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on message_threads
CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON message_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on messages
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_message_at on thread when new message is inserted
CREATE OR REPLACE FUNCTION update_thread_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads
  SET last_message_at = NEW.created_at,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update last_message_at when message is created
CREATE TRIGGER update_thread_last_message_on_insert
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_last_message_at();

-- Enable Row Level Security
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_threads
-- Users can see threads where they are the user_id
CREATE POLICY "Users can view their own threads"
  ON message_threads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Vendors can see threads where they are the vendor_id
-- Note: This assumes vendors have a user_id that matches their vendor.user_id
CREATE POLICY "Vendors can view threads for their vendor"
  ON message_threads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = message_threads.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Users can create threads where they are the user_id
CREATE POLICY "Users can create threads"
  ON message_threads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for messages
-- Users can see messages in threads they have access to
CREATE POLICY "Users can view messages in their threads"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
      AND (
        message_threads.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM vendors
          WHERE vendors.id = message_threads.vendor_id
          AND vendors.user_id = auth.uid()
        )
      )
    )
  );

-- Users can insert messages to threads they're part of
CREATE POLICY "Users can send messages in their threads"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
      AND (
        message_threads.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM vendors
          WHERE vendors.id = message_threads.vendor_id
          AND vendors.user_id = auth.uid()
        )
      )
    )
  );

-- Users can update their own messages (for read receipts, etc.)
CREATE POLICY "Users can update messages in their threads"
  ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = messages.thread_id
      AND (
        message_threads.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM vendors
          WHERE vendors.id = message_threads.vendor_id
          AND vendors.user_id = auth.uid()
        )
      )
    )
  );

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Add comments for documentation
COMMENT ON TABLE message_threads IS 'Conversation threads between users and vendors';
COMMENT ON TABLE messages IS 'Individual messages within conversation threads';
COMMENT ON COLUMN message_threads.last_message_at IS 'Timestamp of the most recent message in the thread';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when the message was read by the recipient';
