-- ============================================================
-- Wedding Websites Feature
-- Tables: templates, websites, sections, rsvps
-- Idempotent: uses IF NOT EXISTS so re-runs are safe.
-- ============================================================

-- 1. Wedding Website Templates
CREATE TABLE IF NOT EXISTS wedding_website_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'classic',
  preview_image TEXT,
  thumbnail_image TEXT,
  default_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Wedding Websites
CREATE TABLE IF NOT EXISTS wedding_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID,
  template_id UUID REFERENCES wedding_website_templates(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  partner1_name TEXT NOT NULL DEFAULT '',
  partner2_name TEXT NOT NULL DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wedding_websites_user_id ON wedding_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_websites_slug ON wedding_websites(slug);
CREATE INDEX IF NOT EXISTS idx_wedding_websites_status ON wedding_websites(status);

-- 3. Wedding Website Sections
CREATE TABLE IF NOT EXISTS wedding_website_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES wedding_websites(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_website_sections_website_id ON wedding_website_sections(website_id);

-- 4. Wedding Website RSVPs
CREATE TABLE IF NOT EXISTS wedding_website_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES wedding_websites(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  response TEXT NOT NULL DEFAULT 'pending',
  guest_count INT DEFAULT 1,
  dietary TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_website_rsvps_website_id ON wedding_website_rsvps(website_id);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Templates: public read
ALTER TABLE wedding_website_templates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wedding_website_templates' AND policyname = 'Templates are viewable by everyone') THEN
    CREATE POLICY "Templates are viewable by everyone"
      ON wedding_website_templates FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- Websites: owner CRUD, public read when published
ALTER TABLE wedding_websites ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wedding_websites' AND policyname = 'Users can manage their own websites') THEN
    CREATE POLICY "Users can manage their own websites"
      ON wedding_websites FOR ALL
      USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wedding_websites' AND policyname = 'Published websites are viewable by everyone') THEN
    CREATE POLICY "Published websites are viewable by everyone"
      ON wedding_websites FOR SELECT
      USING (status = 'published');
  END IF;
END $$;

-- Sections: follow parent website access
ALTER TABLE wedding_website_sections ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wedding_website_sections' AND policyname = 'Users can manage sections of their own websites') THEN
    CREATE POLICY "Users can manage sections of their own websites"
      ON wedding_website_sections FOR ALL
      USING (
        website_id IN (SELECT id FROM wedding_websites WHERE user_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wedding_website_sections' AND policyname = 'Published website sections are viewable') THEN
    CREATE POLICY "Published website sections are viewable"
      ON wedding_website_sections FOR SELECT
      USING (
        website_id IN (SELECT id FROM wedding_websites WHERE status = 'published')
      );
  END IF;
END $$;

-- RSVPs: anyone can insert, owner can read
ALTER TABLE wedding_website_rsvps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wedding_website_rsvps' AND policyname = 'Anyone can submit RSVP') THEN
    CREATE POLICY "Anyone can submit RSVP"
      ON wedding_website_rsvps FOR INSERT
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wedding_website_rsvps' AND policyname = 'Website owners can view RSVPs') THEN
    CREATE POLICY "Website owners can view RSVPs"
      ON wedding_website_rsvps FOR SELECT
      USING (
        website_id IN (SELECT id FROM wedding_websites WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- ============================================================
-- Storage Bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-websites',
  'wedding-websites',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload to their website folder') THEN
    CREATE POLICY "Users can upload to their website folder"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'wedding-websites'
        AND (storage.foldername(name))[1] IN (
          SELECT id::text FROM wedding_websites WHERE user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public can view wedding website images') THEN
    CREATE POLICY "Public can view wedding website images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'wedding-websites');
  END IF;
END $$;

-- ============================================================
-- Seed Templates (upsert by slug to be idempotent)
-- ============================================================

INSERT INTO wedding_website_templates (name, slug, description, category, default_config, sort_order) VALUES
(
  'Eternal Elegance',
  'eternal-elegance',
  'A timeless classic design with soft ivory tones and refined serif typography.',
  'classic',
  '{
    "colors": {"primary": "#8B7355", "secondary": "#D4C5A9", "background": "#FFFEF7", "text": "#2C2C2C", "accent": "#F5F0E8"},
    "fonts": {"heading": "Playfair Display", "body": "Inter"},
    "sections": ["hero", "our-story", "details", "gallery", "rsvp"],
    "heroStyle": "fullwidth-image",
    "layoutVariant": "centered"
  }',
  1
),
(
  'Modern Love',
  'modern-love',
  'A clean, contemporary design with bold contrasts and modern sans-serif fonts.',
  'modern',
  '{
    "colors": {"primary": "#1A1A2E", "secondary": "#E8E8E8", "background": "#FFFFFF", "text": "#1A1A2E", "accent": "#F8F8FA"},
    "fonts": {"heading": "Montserrat", "body": "Open Sans"},
    "sections": ["hero", "our-story", "details", "gallery", "rsvp"],
    "heroStyle": "split-image",
    "layoutVariant": "asymmetric"
  }',
  2
),
(
  'Garden Romance',
  'garden-romance',
  'Lush botanical greens and warm floral accents for outdoor and garden weddings.',
  'garden',
  '{
    "colors": {"primary": "#4A6741", "secondary": "#C8D5B9", "background": "#FAFDF7", "text": "#2D3B29", "accent": "#EFF5EB"},
    "fonts": {"heading": "Cormorant Garamond", "body": "Raleway"},
    "sections": ["hero", "our-story", "details", "gallery", "rsvp"],
    "heroStyle": "fullwidth-image",
    "layoutVariant": "centered"
  }',
  3
),
(
  'Rustic Charm',
  'rustic-charm',
  'Warm earthy tones with handcrafted textures for barn and countryside celebrations.',
  'rustic',
  '{
    "colors": {"primary": "#8B4513", "secondary": "#DEB887", "background": "#FFF8F0", "text": "#3E2723", "accent": "#F5EDE3"},
    "fonts": {"heading": "Sacramento", "body": "Lora"},
    "sections": ["hero", "our-story", "details", "gallery", "rsvp"],
    "heroStyle": "fullwidth-image",
    "layoutVariant": "centered"
  }',
  4
),
(
  'Minimal Bliss',
  'minimal-bliss',
  'A refined minimalist design that lets your content and photography speak for itself.',
  'minimalist',
  '{
    "colors": {"primary": "#333333", "secondary": "#999999", "background": "#FFFFFF", "text": "#111111", "accent": "#F5F5F5"},
    "fonts": {"heading": "Josefin Sans", "body": "Work Sans"},
    "sections": ["hero", "our-story", "details", "gallery", "rsvp"],
    "heroStyle": "centered-text",
    "layoutVariant": "centered"
  }',
  5
),
(
  'Sunset Glow',
  'sunset-glow',
  'Warm romantic hues inspired by golden hour, perfect for beach and destination weddings.',
  'romantic',
  '{
    "colors": {"primary": "#C2627A", "secondary": "#F5C6AA", "background": "#FFF9F5", "text": "#2E1F1F", "accent": "#FFF0EB"},
    "fonts": {"heading": "Sacramento", "body": "Inter"},
    "sections": ["hero", "our-story", "details", "gallery", "rsvp"],
    "heroStyle": "fullwidth-image",
    "layoutVariant": "centered"
  }',
  6
)
ON CONFLICT (slug) DO NOTHING;
