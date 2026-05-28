-- Allow SVG uploads in the public CMS storage buckets.
--
-- Card-design artwork for opus_pass invitation products is authored as SVG so
-- it can scale crisply on the product page. The website-media bucket's
-- allowed_mime_types previously omitted image/svg+xml, causing signed-URL PUTs
-- with Content-Type: image/svg+xml to be rejected by Storage.
--
-- Idempotent: re-running this migration is a no-op when the allowlist already
-- contains SVG, because array_append-on-NULL handling is short-circuited and
-- the `where not array contains` predicate guards against duplicates.

UPDATE storage.buckets
   SET allowed_mime_types = allowed_mime_types || ARRAY['image/svg+xml']
 WHERE id IN ('studio-assets', 'website-media', 'cms')
   AND NOT ('image/svg+xml' = ANY(allowed_mime_types));
