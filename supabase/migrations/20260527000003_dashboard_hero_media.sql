-- OpusPass couple dashboard — per-page hero media (image or video)
--
-- Each couple can upload one hero cover per dashboard page slug
-- (invitations | guests | rsvps | website). Stored in a public bucket
-- so the URL can be embedded directly as a background. Server actions
-- gate uploads/deletes; RLS is defense-in-depth.

CREATE TABLE IF NOT EXISTS dashboard_hero_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  page_slug TEXT NOT NULL CHECK (page_slug IN ('invitations', 'guests', 'rsvps', 'website')),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  storage_path TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, page_slug)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_hero_media_user
  ON dashboard_hero_media(user_id);

CREATE OR REPLACE FUNCTION update_dashboard_hero_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dashboard_hero_media_updated_at ON dashboard_hero_media;
CREATE TRIGGER dashboard_hero_media_updated_at
  BEFORE UPDATE ON dashboard_hero_media
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_hero_media_updated_at();

ALTER TABLE dashboard_hero_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dashboard_hero_media_select_own ON dashboard_hero_media;
CREATE POLICY dashboard_hero_media_select_own ON dashboard_hero_media
  FOR SELECT USING (
    requesting_user_id() = user_id
    OR EXISTS (SELECT 1 FROM users WHERE id = requesting_user_id() AND role = 'admin')
  );

DROP POLICY IF EXISTS dashboard_hero_media_insert_own ON dashboard_hero_media;
CREATE POLICY dashboard_hero_media_insert_own ON dashboard_hero_media
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

DROP POLICY IF EXISTS dashboard_hero_media_update_own ON dashboard_hero_media;
CREATE POLICY dashboard_hero_media_update_own ON dashboard_hero_media
  FOR UPDATE USING (requesting_user_id() = user_id);

DROP POLICY IF EXISTS dashboard_hero_media_delete_own ON dashboard_hero_media;
CREATE POLICY dashboard_hero_media_delete_own ON dashboard_hero_media
  FOR DELETE USING (requesting_user_id() = user_id);

-- Storage bucket: public read so URLs can be used directly as <img>/<video> src.
-- Writes are gated by server actions using the service-role client.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dashboard-hero-media',
  'dashboard-hero-media',
  true,
  52428800, -- 50 MB to comfortably fit short hero videos
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "dashboard hero owners read" ON storage.objects;
CREATE POLICY "dashboard hero owners read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'dashboard-hero-media');

DROP POLICY IF EXISTS "dashboard hero owners write" ON storage.objects;
CREATE POLICY "dashboard hero owners write" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dashboard-hero-media'
    AND (storage.foldername(name))[1] = requesting_user_id()::text
  );

DROP POLICY IF EXISTS "dashboard hero owners update" ON storage.objects;
CREATE POLICY "dashboard hero owners update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'dashboard-hero-media'
    AND (storage.foldername(name))[1] = requesting_user_id()::text
  );

DROP POLICY IF EXISTS "dashboard hero owners delete" ON storage.objects;
CREATE POLICY "dashboard hero owners delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dashboard-hero-media'
    AND (storage.foldername(name))[1] = requesting_user_id()::text
  );
