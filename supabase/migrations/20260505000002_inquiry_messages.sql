-- Bidirectional messages on inquiry threads.
-- Both client follow-up messages and vendor replies are stored here.
-- All access goes through service-role API routes — no direct client access.

CREATE TABLE IF NOT EXISTS inquiry_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id  UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'vendor')),
  sender_name TEXT NOT NULL,
  content     TEXT NOT NULL,
  read_at     TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry_id ON inquiry_messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_created_at ON inquiry_messages(created_at);

ALTER TABLE inquiry_messages ENABLE ROW LEVEL SECURITY;

-- Block all direct client/anon access; our API routes use service role which bypasses RLS.
CREATE POLICY "deny_direct_access" ON inquiry_messages FOR ALL USING (false);
