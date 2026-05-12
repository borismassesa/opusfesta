-- Storage buckets: raise per-file size limits to take advantage of the
-- Supabase Pro tier (free tier caps every bucket at 50MB; Pro allows up
-- to 5GB per file). Also add video MIME types to buckets that already
-- hold editorial/CMS media so video uploads stop failing the bucket-
-- level mime check.
--
-- These ALTERs are idempotent; existing rows in storage.buckets are
-- updated in place.

-- vendor-assets — logos, covers, portfolio thumbnails. 25MB covers a
-- raw iPhone HEIC original before any client compression. Also restores
-- the image-only MIME restriction (it had been wiped to NULL at some
-- point via Studio UI, so the bucket was accepting any file type).
UPDATE storage.buckets
   SET file_size_limit = 26214400, -- 25MB
       allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
 WHERE id = 'vendor-assets';

-- portal-avatars — vendor-portal avatar uploads (created via Studio UI,
-- not in earlier migration files). 2MB was too tight for modern phone
-- photos; 10MB matches the contributor avatar cap.
UPDATE storage.buckets
   SET file_size_limit = 10485760 -- 10MB
 WHERE id = 'portal-avatars';

-- wedding-websites — couple-facing wedding-website builder assets
-- (created via Studio UI, not in earlier migration files).
UPDATE storage.buckets
   SET file_size_limit = 26214400 -- 25MB
 WHERE id = 'wedding-websites';

-- vendor-portfolios — the storefront gallery. Client-side compression
-- still squeezes to ~1-2MB per photo (compress-image.ts), but the
-- bucket allows generously sized originals if a vendor needs them.
UPDATE storage.buckets
   SET file_size_limit = 52428800 -- 50MB
 WHERE id = 'vendor-portfolios';

-- vendor_verification — business docs / IDs. PDFs of scanned multi-
-- page documents can exceed 10MB.
UPDATE storage.buckets
   SET file_size_limit = 26214400 -- 25MB
 WHERE id = 'vendor_verification';

-- careers — resume/CV uploads. Designed multi-page PDFs with embedded
-- portfolio images can land between 5-15MB.
UPDATE storage.buckets
   SET file_size_limit = 15728640 -- 15MB
 WHERE id = 'careers';

-- employees — internal HR docs.
UPDATE storage.buckets
   SET file_size_limit = 26214400 -- 25MB
 WHERE id = 'employees';

-- submission-covers — contributor article cover images.
UPDATE storage.buckets
   SET file_size_limit = 26214400 -- 25MB
 WHERE id = 'submission-covers';

-- studio-assets, website-media, cms — public CMS buckets that
-- previously had no file_size_limit set (defaulted to project cap).
-- Set an explicit 500MB cap and allow image + video MIME types so
-- editorial and homepage video uploads can use these buckets via
-- signed-URL direct upload (bypassing Vercel function payload caps).
UPDATE storage.buckets
   SET file_size_limit = 524288000, -- 500MB
       allowed_mime_types = ARRAY[
         'image/jpeg',
         'image/png',
         'image/webp',
         'image/gif',
         'image/avif',
         'video/mp4',
         'video/webm',
         'video/quicktime'
       ]
 WHERE id IN ('studio-assets', 'website-media', 'cms');
