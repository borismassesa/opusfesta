-- Gift registry hero — Zola-style banner + editable header.
--
-- The manage-registry hero card gets a wide banner photo (behind the couple
-- name) in addition to the existing small circular "Photo" (registry_cover_
-- image_url) and welcome message. `registry_header` lets the couple override
-- the displayed name (defaults to the derived partner1/partner2 names when
-- unset) without touching couple_profiles.partner1_name/partner2_name, which
-- are used elsewhere (invite hub, WhatsApp templates, pledge page).

ALTER TABLE couple_profiles
  ADD COLUMN IF NOT EXISTS registry_header TEXT,
  ADD COLUMN IF NOT EXISTS registry_banner_image_url TEXT;

NOTIFY pgrst, 'reload schema';
