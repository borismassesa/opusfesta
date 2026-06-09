-- Designer-uploaded card designs for invitation products.
--
-- The product detail page used to composite a single card SVG into a set of
-- global "mockup carousel" photo scenes (flat-lay, envelope, phone, …). That
-- approach is retired: designers now upload up to 5 finished card images per
-- product, and the detail page shows them in a carousel at the 5:7 card ratio.
--
-- `designs` is an ordered array of image URLs (PNG/JPG/WebP/SVG), max 5,
-- managed in the admin product editor. Existing rows default to an empty array
-- and fall back to their legacy image_url/gallery artwork until migrated.
alter table website_invitations_products
  add column if not exists designs jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';
