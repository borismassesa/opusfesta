-- OF-VND-0006: storefront persistence columns
--
-- Until now, the vendor portal's storefront editors for Team, FAQ,
-- Recognition, Hours, Photos and a chunk of the Profile fields wrote only
-- to localStorage. This migration adds DB columns for every field a vendor
-- can edit on their storefront, so:
--   1. Edits survive a logout / device switch
--   2. Admin operations review can show + approve every section
--   3. The public profile maps directly from structured columns
--
-- Each column is nullable / has a sensible default; downstream code is
-- already defensive (snapshot fallback, missing-section hide), so this
-- migration is non-breaking.

ALTER TABLE public.vendors
  -- Already added by migration 021 in some envs; idempotent here.
  ADD COLUMN IF NOT EXISTS packages JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS awards TEXT,                           -- free-text recognition / awards block
  ADD COLUMN IF NOT EXISTS award_certificates JSONB DEFAULT '[]'::jsonb, -- [{ id, title, issuer, year, fileName, status, notes }]

  ADD COLUMN IF NOT EXISTS team JSONB DEFAULT '[]'::jsonb,        -- [{ id, name, role, bio, avatar }]
  ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb,        -- [{ id, question, answer }]

  ADD COLUMN IF NOT EXISTS hours JSONB,                           -- { mon:{open,from,to}, tue:..., ... }
  ADD COLUMN IF NOT EXISTS languages TEXT[],                      -- ['en','sw','fr']

  ADD COLUMN IF NOT EXISTS response_time_hours TEXT,              -- vendor-typed phrase, e.g. "4 hours"
  ADD COLUMN IF NOT EXISTS locally_owned BOOLEAN,
  ADD COLUMN IF NOT EXISTS parallel_booking_capacity INTEGER,

  ADD COLUMN IF NOT EXISTS deposit_percent TEXT,                  -- "30" — vendor enters a string, kept as string
  ADD COLUMN IF NOT EXISTS cancellation_level TEXT,               -- 'flexible' | 'moderate' | 'strict'
  ADD COLUMN IF NOT EXISTS reschedule_policy TEXT,                -- 'one-free' | 'unlimited' | 'none'

  ADD COLUMN IF NOT EXISTS style TEXT,                            -- 'modern' | 'traditional' | etc.
  ADD COLUMN IF NOT EXISTS personality TEXT,                      -- 'warm' | 'lively' | etc.

  ADD COLUMN IF NOT EXISTS service_markets TEXT[],                -- IDs from the onboarding catalogue
  ADD COLUMN IF NOT EXISTS home_market TEXT,                      -- single ID

  -- Per-section verification status. Holds {"profile":"approved", "photos":"pending", ...}.
  -- Each entry is one of: 'pending' | 'approved' | 'rejected'.
  -- Lets admin operations gate "Approve & activate" on every section being
  -- approved, instead of approving the whole vendor in one click without
  -- reviewing each storefront tab.
  ADD COLUMN IF NOT EXISTS section_status JSONB DEFAULT '{}'::jsonb;

-- Indexes on columns the website + admin will filter / sort by.
CREATE INDEX IF NOT EXISTS idx_vendors_languages_gin
  ON public.vendors USING GIN (languages);
CREATE INDEX IF NOT EXISTS idx_vendors_style
  ON public.vendors (style);
CREATE INDEX IF NOT EXISTS idx_vendors_locally_owned
  ON public.vendors (locally_owned) WHERE locally_owned = true;

COMMENT ON COLUMN public.vendors.packages IS
  'Array of pricing packages: [{id,name,price,description,includes:[]}].';
COMMENT ON COLUMN public.vendors.awards IS
  'Free-text awards / recognition block from /storefront/recognition.';
COMMENT ON COLUMN public.vendors.award_certificates IS
  'Uploaded certificates: [{id,title,issuer,year,fileName,status,notes}].';
COMMENT ON COLUMN public.vendors.team IS
  'Team members: [{id,name,role,bio,avatar}].';
COMMENT ON COLUMN public.vendors.faqs IS
  'Vendor FAQ list: [{id,question,answer}].';
COMMENT ON COLUMN public.vendors.hours IS
  'Operating hours: {mon:{open,from,to}, tue:..., sun:...}.';
COMMENT ON COLUMN public.vendors.languages IS
  'Spoken languages, ISO-ish IDs from the onboarding catalogue.';
COMMENT ON COLUMN public.vendors.section_status IS
  'Per-storefront-section moderation state. Keys: profile, photos, services, packages, recognition, team, faq. Values: pending|approved|rejected.';

NOTIFY pgrst, 'reload schema';
