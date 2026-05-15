-- Vendor portfolio videos — first-class column + storage support.
--
-- Until now the vendor portal Photos & Videos page kept videos in
-- browser memory only (object URLs that vanish on reload). With Pro
-- tier storage we can keep the originals in the existing
-- `vendor-portfolios` bucket. This migration:
--
--   1. Adds `video_urls TEXT[]` to `vendors` so the public storefront
--      and admin review can render video reels alongside photos.
--   2. Extends the `vendor-portfolios` storage bucket to accept video
--      MIME types and bump the per-file cap to 500 MB (Pro tier supports
--      up to 5 GB; 500 MB is well above what a wedding highlight reel
--      needs while keeping costs predictable).

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS video_urls TEXT[];

COMMENT ON COLUMN public.vendors.video_urls
  IS 'Public portfolio video reels — fully-qualified URLs (uploaded MP4/MOV/WebM or YouTube/Vimeo links).';

UPDATE storage.buckets
   SET file_size_limit = 524288000, -- 500 MB
       allowed_mime_types = ARRAY[
         'image/jpeg',
         'image/png',
         'image/webp',
         'image/gif',
         'video/mp4',
         'video/webm',
         'video/quicktime'
       ]
 WHERE id = 'vendor-portfolios';
