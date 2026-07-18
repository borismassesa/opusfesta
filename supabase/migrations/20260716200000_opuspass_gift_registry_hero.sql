-- Gift registry "hero" customization — a Zola-style welcome card at the top
-- of the manage-registry page: a photo, and a short welcome message for
-- guests. Deliberately separate from couple_profiles.cover_image_url (which
-- is shared across WhatsApp templates, the pledge page, and the invite hub)
-- so customizing the registry's own photo doesn't change those surfaces.

ALTER TABLE couple_profiles
  ADD COLUMN IF NOT EXISTS registry_cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS registry_welcome_message TEXT;

NOTIFY pgrst, 'reload schema';
