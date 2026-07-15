-- OpusPass digital guestbook — video attachments
--
-- Adds an optional video memory to a guestbook entry, alongside the existing
-- optional photo_url and audio_url. A guestbook entry can carry at most one
-- of photo/video (guests pick one media type in the composer) plus an
-- optional voice note. Uploaded the same way photos are — via the no-auth
-- server action using the service-role client.

ALTER TABLE guestbook_entries
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Storage bucket for guest-uploaded video memories. Public read (approved
-- videos play back on the guestbook page), service-role write only.
INSERT INTO storage.buckets (id, name, public)
VALUES ('guestbook-videos', 'guestbook-videos', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'public_read_guestbook_videos'
  ) THEN
    CREATE POLICY "public_read_guestbook_videos" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'guestbook-videos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'service_role_all_guestbook_videos'
  ) THEN
    CREATE POLICY "service_role_all_guestbook_videos" ON storage.objects
      FOR ALL TO service_role
      USING (bucket_id = 'guestbook-videos')
      WITH CHECK (bucket_id = 'guestbook-videos');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
