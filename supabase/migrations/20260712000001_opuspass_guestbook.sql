-- OpusPass digital guestbook — guest-submitted messages & memories
--
-- Any visitor to a couple's published wedding website (/w/<slug>) can leave a
-- name + message (and optionally a photo "memory"). Entries land as `pending`
-- so the couple can moderate before they appear publicly, mirroring the
-- existing public-guest self-registration review flow (guest_contacts'
-- review_status: 'confirmed' | 'unconfirmed').
--
-- Ownership is denormalized onto the table via user_id (-> users.id) so RLS
-- stays a simple `requesting_user_id() = user_id` check, matching the rest of
-- the couple-dashboard schema. Public writes are NOT granted via RLS — the
-- submission flow goes through a trusted server action using the
-- service-role client, which resolves the owning couple from the public slug.

CREATE TABLE IF NOT EXISTS guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  -- Public URL of an optional attached photo memory (guestbook-photos bucket).
  photo_url TEXT,
  -- Optional self-selected relation to the couple ('Family' | 'Friend' |
  -- 'Colleague'), shown as a byline on the public wishes wall — mirrors the
  -- wedding_website design's WishForm "Relation" field.
  relation TEXT,

  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'hidden')),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guestbook_entries_user_id ON guestbook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_entries_user_status ON guestbook_entries(user_id, review_status);

DROP TRIGGER IF EXISTS trg_guestbook_entries_updated_at ON guestbook_entries;
CREATE TRIGGER trg_guestbook_entries_updated_at
  BEFORE UPDATE ON guestbook_entries FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- RLS: owner-only. Public inserts go through the service role (see
-- submitGuestbookEntry in apps/opus_pass/src/lib/dashboard/actions.ts).
ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS guestbook_entries_owner ON guestbook_entries;
CREATE POLICY guestbook_entries_owner ON guestbook_entries
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

-- Storage bucket for guest-uploaded photo memories. Public read (so approved
-- photos render on the published site), service-role write only (the upload
-- happens inside the same no-auth server action as the message insert).
INSERT INTO storage.buckets (id, name, public)
VALUES ('guestbook-photos', 'guestbook-photos', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'public_read_guestbook_photos'
  ) THEN
    CREATE POLICY "public_read_guestbook_photos" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'guestbook-photos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'service_role_all_guestbook_photos'
  ) THEN
    CREATE POLICY "service_role_all_guestbook_photos" ON storage.objects
      FOR ALL TO service_role
      USING (bucket_id = 'guestbook-photos')
      WITH CHECK (bucket_id = 'guestbook-photos');
  END IF;
END $$;

-- Extend the notifications type CHECK so hosts get a bell notification when a
-- guest leaves a message (mirrors 'rsvp_received' / 'pledge_received').
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('rsvp_received', 'pledge_received', 'payment_confirmed', 'guestbook_received', 'system'));

NOTIFY pgrst, 'reload schema';
