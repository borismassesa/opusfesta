-- Store client preference for inquiry email updates.
-- This is an opt-in flag captured from the website inquiry form.

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS email_notifications_opt_in BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN inquiries.email_notifications_opt_in IS
  'Whether the client opted in to receive email notifications for inquiry updates.';
