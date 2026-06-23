-- OpusPass — publish the built wedding website
--
-- The website builder (/website-builder) produces a self-contained SiteDoc JSON.
-- To let a couple put their site live at a forwardable URL (/w/<slug>) we store
-- that document on their couple_profiles row and stamp when it was published.
--
-- Reuses the public-sharing handle + kill switch added in
-- 20260616000001_opuspass_public_invite.sql:
--   * public_slug             — the /w/<slug> handle (shared with the invite hub)
--   * public_sharing_enabled  — host-revocable master switch
--
-- Public reads run through the service-role client (getPublishedWebsite); the
-- SiteDoc is non-PII (couple names, public event copy, photos) so the whole
-- document is safe to serve. Photos are stored as URLs (pledge-covers bucket),
-- not base64, to keep the row lean.

ALTER TABLE public.couple_profiles
  ADD COLUMN IF NOT EXISTS website_doc          JSONB,
  ADD COLUMN IF NOT EXISTS website_published_at TIMESTAMPTZ;

-- Fast public lookup of live sites (slug + published).
CREATE INDEX IF NOT EXISTS idx_couple_profiles_website_published
  ON public.couple_profiles(public_slug)
  WHERE website_published_at IS NOT NULL;
