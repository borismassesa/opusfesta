-- Bilingual (English + Swahili) support for invitation product cards.
-- Adds nullable Swahili twins for the two user-facing text fields (name,
-- description). Additive and backward-compatible: existing rows get NULL and
-- the public loader falls back to the English value until an admin fills the
-- Swahili. `designer` stays single-value (proper name); `category` is localized
-- via the categories CMS, not here.
alter table website_invitations_products
  add column if not exists name_sw text,
  add column if not exists description_sw text;
