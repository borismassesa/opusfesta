-- Wedding Website Builder — couples can create and share a wedding website

-- 1) Wedding Websites (one per couple)
CREATE TABLE IF NOT EXISTS wedding_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  couple_profile_id UUID REFERENCES couple_profiles(id) ON DELETE SET NULL,

  -- URL & identity
  slug TEXT NOT NULL UNIQUE,
  custom_domain TEXT,

  -- Theme
  theme TEXT NOT NULL DEFAULT 'classic',
  primary_color TEXT DEFAULT '#1A1A2E',
  accent_color TEXT DEFAULT '#C4920A',
  font_family TEXT DEFAULT 'playfair',

  -- SEO / meta
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,

  -- Status
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,

  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Website Sections (JSONB content per section, follows studio_page_sections pattern)
CREATE TABLE IF NOT EXISTS wedding_website_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES wedding_websites(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(website_id, section_key)
);

-- 3) RSVP Responses
CREATE TABLE IF NOT EXISTS wedding_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES wedding_websites(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  attending TEXT NOT NULL DEFAULT 'pending',
  plus_one BOOLEAN DEFAULT false,
  plus_one_name TEXT,
  dietary_notes TEXT,
  message TEXT,
  meal_choice TEXT,
  submitted_via TEXT DEFAULT 'form',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Guestbook Entries
CREATE TABLE IF NOT EXISTS wedding_guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES wedding_websites(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wedding_websites_user_id ON wedding_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_websites_slug ON wedding_websites(slug);
CREATE INDEX IF NOT EXISTS idx_wws_website_id ON wedding_website_sections(website_id);
CREATE INDEX IF NOT EXISTS idx_wedding_rsvps_website_id ON wedding_rsvps(website_id);
CREATE INDEX IF NOT EXISTS idx_wedding_guestbook_website_id ON wedding_guestbook_entries(website_id);

-- Updated-at triggers
CREATE OR REPLACE FUNCTION update_wedding_websites_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wedding_websites_updated_at
  BEFORE UPDATE ON wedding_websites FOR EACH ROW
  EXECUTE FUNCTION update_wedding_websites_updated_at();

CREATE OR REPLACE FUNCTION update_wws_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wws_updated_at
  BEFORE UPDATE ON wedding_website_sections FOR EACH ROW
  EXECUTE FUNCTION update_wws_updated_at();

-- RLS
ALTER TABLE wedding_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_guestbook_entries ENABLE ROW LEVEL SECURITY;

-- Owner full access
CREATE POLICY wedding_websites_owner ON wedding_websites
  FOR ALL USING (requesting_user_id() = user_id);

-- Sections: owner access through website join
CREATE POLICY wws_owner ON wedding_website_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM wedding_websites w WHERE w.id = website_id AND w.user_id = requesting_user_id())
  );

-- Public read for published websites
CREATE POLICY wedding_websites_public_read ON wedding_websites
  FOR SELECT USING (is_published = true);

CREATE POLICY wws_public_read ON wedding_website_sections
  FOR SELECT USING (
    is_published = true AND
    EXISTS (SELECT 1 FROM wedding_websites w WHERE w.id = website_id AND w.is_published = true)
  );

-- Anyone can submit RSVPs to published websites
CREATE POLICY wedding_rsvps_insert ON wedding_rsvps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM wedding_websites w WHERE w.id = website_id AND w.is_published = true)
  );

-- Owner reads all RSVPs
CREATE POLICY wedding_rsvps_owner_read ON wedding_rsvps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM wedding_websites w WHERE w.id = website_id AND w.user_id = requesting_user_id())
  );

-- Anyone can submit guestbook entries to published websites
CREATE POLICY wedding_guestbook_insert ON wedding_guestbook_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM wedding_websites w WHERE w.id = website_id AND w.is_published = true)
  );

-- Owner manages all guestbook entries
CREATE POLICY wedding_guestbook_owner ON wedding_guestbook_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM wedding_websites w WHERE w.id = website_id AND w.user_id = requesting_user_id())
  );

-- Public reads approved guestbook entries on published sites
CREATE POLICY wedding_guestbook_public_read ON wedding_guestbook_entries
  FOR SELECT USING (
    is_approved = true AND
    EXISTS (SELECT 1 FROM wedding_websites w WHERE w.id = website_id AND w.is_published = true)
  );
