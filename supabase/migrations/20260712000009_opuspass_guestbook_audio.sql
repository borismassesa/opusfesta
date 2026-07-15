-- OpusPass digital guestbook — voice note attachments
--
-- Adds an optional audio recording to a guestbook entry, alongside the
-- existing optional photo_url. Recorded client-side (MediaRecorder) on the
-- public guestbook page and uploaded the same way photos are — via the
-- no-auth server action using the service-role client.

ALTER TABLE guestbook_entries
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Storage bucket for guest-recorded voice notes. Public read (approved
-- recordings play back on the guestbook page), service-role write only.
INSERT INTO storage.buckets (id, name, public)
VALUES ('guestbook-audio', 'guestbook-audio', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'public_read_guestbook_audio'
  ) THEN
    CREATE POLICY "public_read_guestbook_audio" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'guestbook-audio');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'service_role_all_guestbook_audio'
  ) THEN
    CREATE POLICY "service_role_all_guestbook_audio" ON storage.objects
      FOR ALL TO service_role
      USING (bucket_id = 'guestbook-audio')
      WITH CHECK (bucket_id = 'guestbook-audio');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
