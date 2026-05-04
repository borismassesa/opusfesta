-- Storefront draft/publish workflow
--
-- Adds a draft_content JSONB column to public.vendors so storefront edits in
-- the vendors_portal can be staged before going live on opus_website
-- /vendors/[slug]. Mirrors the website_page_sections.draft_content pattern.
--
-- Schema convention for draft_content:
--   {
--     "about": {
--       "business_name": "...",
--       "years_in_business": 5,
--       "bio": "...",
--       "location": { ... },
--       "contact_info": { ... },
--       "social_links": { ... }
--     },
--     "packages": [...],
--     "services_offered": [...],
--     "team": [...],
--     "faqs": [...],
--     "awards": [...],
--     "gallery": [...]
--   }
--
-- Each storefront section saves to its own key. publishStorefront() server
-- action (apps/vendors_portal/src/app/(portal)/storefront/actions.ts) flattens
-- and applies all keys to live columns, then clears draft_content.
--
-- The customer-facing /vendors/[slug] reader (apps/opus_website/src/lib/
-- vendors-db.ts) selects only live columns — draft_content is invisible to
-- couples until the vendor publishes.

alter table public.vendors
  add column if not exists draft_content jsonb default null;

comment on column public.vendors.draft_content is
  'Staged storefront edits not yet published to live columns. NULL = no pending changes.';

-- No new RLS policies needed: draft_content is an additional column on
-- vendors, so existing read/write policies (owner/manager via vendor_memberships,
-- service_role full access) already cover it.
