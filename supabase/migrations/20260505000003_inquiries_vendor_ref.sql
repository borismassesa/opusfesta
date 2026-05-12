-- Allow quote requests from both marketplace vendors (UUID in vendors table)
-- and website CMS vendors (text slugs in website_vendors).
--
-- Strategy: keep vendor_id as UUID (preserving type and all RLS policies),
-- make it nullable so CMS vendors store NULL there, and add vendor_slug TEXT
-- to always carry the routing identifier.  PostgreSQL FK constraints allow
-- NULL, so marketplace vendor UUIDs still validate against vendors.id while
-- CMS vendors just use NULL vendor_id + vendor_slug.

ALTER TABLE inquiries
  ALTER COLUMN vendor_id DROP NOT NULL;

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS vendor_slug TEXT;

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS vendor_name TEXT;
