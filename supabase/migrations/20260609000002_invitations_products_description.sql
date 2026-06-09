-- Per-card editable "Details" description for invitation products.
--
-- The product detail page shows a short "Details" paragraph under the card.
-- It used to be hardcoded (and referenced a "customisable colour palette" that
-- no longer applies now that cards are designer-uploaded flat images). This
-- column lets designers write the paragraph per card; the page falls back to an
-- auto-generated line from name + designer when it's empty.
alter table website_invitations_products
  add column if not exists description text not null default '';

notify pgrst, 'reload schema';
