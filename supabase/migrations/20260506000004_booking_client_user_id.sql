-- Link vendor_bookings to the authenticated client (user) who submitted the inquiry.
-- Nullable: off-platform / walk-in leads have no registered user.

ALTER TABLE vendor_bookings
  ADD COLUMN IF NOT EXISTS client_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Backfill from the linked inquiry where one exists.
UPDATE vendor_bookings b
SET client_user_id = i.user_id
FROM inquiries i
WHERE b.inquiry_id = i.id
  AND i.user_id IS NOT NULL
  AND b.client_user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_vendor_bookings_client_user_id ON vendor_bookings(client_user_id);

-- Clients can read their own bookings (e.g. for a future client portal view).
CREATE POLICY "clients_select_own_bookings" ON vendor_bookings
  FOR SELECT
  USING (client_user_id = auth.uid());
