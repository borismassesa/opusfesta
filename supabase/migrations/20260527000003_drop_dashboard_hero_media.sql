-- Roll back: the per-couple dashboard_hero_media table is replaced by
-- admin-managed entries in website_page_sections (see seed migration below).
-- The empty `dashboard-hero-media` storage bucket is removed via the Storage API
-- (Supabase blocks bucket deletion from SQL) — done out of band by the operator.

DROP POLICY IF EXISTS "dashboard hero owners read" ON storage.objects;
DROP POLICY IF EXISTS "dashboard hero owners write" ON storage.objects;
DROP POLICY IF EXISTS "dashboard hero owners update" ON storage.objects;
DROP POLICY IF EXISTS "dashboard hero owners delete" ON storage.objects;

DROP TABLE IF EXISTS dashboard_hero_media;
DROP FUNCTION IF EXISTS update_dashboard_hero_media_updated_at();
