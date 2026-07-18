-- OpusPass gift registry — multiple photos + one video per gift.
--
-- Couples asked to upload more than one photo per gift (so guests can see
-- it from a few angles) and an optional short video, mirroring the vendor
-- storefront's gallery_urls/video_urls text[] shape (see
-- apps/vendors_portal storefront photos editor). Replaces the single
-- `image_url` column with `image_urls text[]` and adds `video_url text`.

ALTER TABLE gift_registry_items
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url TEXT;

UPDATE gift_registry_items
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR image_urls = '{}');

ALTER TABLE gift_registry_items DROP COLUMN IF EXISTS image_url;

-- Separate bucket for the (larger) video uploads, mirroring the guestbook's
-- guestbook-photos / guestbook-videos split — same public-read,
-- service-role-write policy shape as gift-registry-images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-registry-videos', 'gift-registry-videos', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'public_read_gift_registry_videos'
  ) THEN
    CREATE POLICY "public_read_gift_registry_videos" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'gift-registry-videos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'service_role_all_gift_registry_videos'
  ) THEN
    CREATE POLICY "service_role_all_gift_registry_videos" ON storage.objects
      FOR ALL TO service_role
      USING (bucket_id = 'gift-registry-videos')
      WITH CHECK (bucket_id = 'gift-registry-videos');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
