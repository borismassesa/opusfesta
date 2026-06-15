-- Promotional status badge shown above invitation cards (catalog, landing picks,
-- and the product detail preview). Admin-set per design via the OpusPass products
-- editor. NULL = no badge (the default). Constrained to the known set so a typo in
-- the admin layer can never render an unstyled/unknown pill on the storefront.
alter table website_invitations_products
  add column if not exists badge text
    check (badge in ('most_popular', 'premium', 'trending'));

notify pgrst, 'reload schema';
