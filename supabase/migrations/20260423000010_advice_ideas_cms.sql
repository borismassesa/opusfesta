-- Advice & Ideas CMS: extend advice_ideas_posts to match the website's rich
-- schema (hero media, excerpt, section grouping, author role, structured body)
-- and seed website_page_sections entries that back the admin page chrome
-- (hero, topics, section intros, and final CTA).

-- ----- Extend advice_ideas_posts -----

ALTER TABLE advice_ideas_posts
  ADD COLUMN IF NOT EXISTS excerpt text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS section_id text NOT NULL DEFAULT 'planning-guides',
  ADD COLUMN IF NOT EXISTS author_role text,
  ADD COLUMN IF NOT EXISTS hero_media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS hero_media_src text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_media_alt text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_media_poster text,
  ADD COLUMN IF NOT EXISTS body jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'advice_ideas_posts_section_id_check'
  ) THEN
    ALTER TABLE advice_ideas_posts
      ADD CONSTRAINT advice_ideas_posts_section_id_check
      CHECK (section_id IN (
        'featured-stories','planning-guides','real-weddings','themes-styles',
        'etiquette-wording','bridal-shower-ideas','honeymoon-ideas'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'advice_ideas_posts_hero_media_type_check'
  ) THEN
    ALTER TABLE advice_ideas_posts
      ADD CONSTRAINT advice_ideas_posts_hero_media_type_check
      CHECK (hero_media_type IN ('image','video'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_advice_ideas_posts_section_id
  ON advice_ideas_posts (section_id);

-- ----- Service-role policy for website_page_sections-style admin writes -----
-- advice_ideas_posts already has a staff-cms-role policy; add a service-role
-- bypass mirror for parity with vendors/homepage admin writes.
DROP POLICY IF EXISTS "service role full access advice ideas posts" ON advice_ideas_posts;
CREATE POLICY "service role full access advice ideas posts"
  ON advice_ideas_posts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----- Seed website_page_sections rows for the page chrome -----

INSERT INTO website_page_sections (page_key, section_key, content, sort_order) VALUES
(
  'advice-and-ideas', 'hero',
  '{
    "eyebrow": "Advice & Ideas",
    "headline": "Editorial ideas for a wedding that still feels like you.",
    "subheadline": "Real weddings, planning notes, hosting scripts, and style stories designed with the same OpusFesta energy: bold, intentional, and easy to move through.",
    "primary_cta_label": "Browse stories",
    "primary_cta_href": "#featured-stories",
    "secondary_cta_label": "Read the cover story",
    "secondary_cta_href": ""
  }'::jsonb,
  1
),
(
  'advice-and-ideas', 'topics',
  '{
    "items": [
      {"id":"featured-stories","label":"Featured Stories","description":"Editor picks, sharp ideas, and standout inspiration."},
      {"id":"planning-guides","label":"Planning Guides","description":"Timelines, vendor strategy, and practical decision making."},
      {"id":"real-weddings","label":"Real Weddings","description":"Celebrations that feel personal, stylish, and deeply local."},
      {"id":"themes-styles","label":"Themes & Styles","description":"Moodboards, palettes, looks, and atmosphere."},
      {"id":"etiquette-wording","label":"Etiquette & Wording","description":"Guest communication, boundaries, and graceful scripts."},
      {"id":"bridal-shower-ideas","label":"Bridal Shower Ideas","description":"Modern ways to host pre-wedding celebrations."},
      {"id":"honeymoon-ideas","label":"Honeymoon Ideas","description":"Escapes, soft landings, and memorable mini-moons."}
    ]
  }'::jsonb,
  2
),
(
  'advice-and-ideas', 'sections',
  '{
    "planning_guides": {
      "eyebrow": "Planning Guides",
      "headline": "The sharp stuff.",
      "description": "Smart planning is not about more spreadsheets. It is about clearer decisions, better pacing, and knowing what deserves your energy.",
      "start_here_eyebrow": "Start Here",
      "start_here_headline": "Protect the budget, guest count, and pace first.",
      "start_here_body": "The strongest planning decisions usually solve one of three things: comfort, timing, or clarity. If a choice does none of those, it probably does not need to happen now.",
      "start_here_pills": ["Budget ceiling","Vendor shortlist","Guest flow"]
    },
    "real_weddings": {
      "eyebrow": "Real Weddings",
      "headline": "Celebrations with point of view.",
      "description": "Weddings we would actually bookmark: strong atmosphere, thoughtful styling, and details that feel specific instead of generic."
    },
    "style_notes": {
      "eyebrow": "Style Notes",
      "headline": "Design, wording, and everything around the edges.",
      "themes_heading": "Themes & Styles",
      "themes_link_label": "View section",
      "etiquette_heading": "Etiquette & Wording",
      "etiquette_link_label": "View section"
    },
    "celebrations": {
      "eyebrow": "Celebrations & Getaways",
      "headline": "Pre-wedding plans worth leaving the group chat for.",
      "description": "Showers, engagement weekends, mini-moons, and the softer stories that shape the weeks around the main event.",
      "note_eyebrow": "Editor\u2019s Note",
      "note_headline": "Keep the pre-wedding plans lighter than the main event.",
      "note_body": "The best showers, engagement dinners, and mini-moons feel directional but not overproduced. Give people one memorable scene and enough room to actually enjoy it.",
      "note_cta_label": "Browse all ideas",
      "note_cta_href": "/advice-and-ideas"
    }
  }'::jsonb,
  3
),
(
  'advice-and-ideas', 'cta',
  '{
    "eyebrow": "Keep exploring",
    "headline": "More ideas, less noise.",
    "subheadline": "Start with the editorial index, then move into the stories that actually match your pace, style, and guest experience.",
    "primary_cta_label": "All articles",
    "primary_cta_href": "/advice-and-ideas",
    "secondary_cta_label": "Back to top",
    "secondary_cta_href": "#featured-stories"
  }'::jsonb,
  4
)
ON CONFLICT (page_key, section_key) DO NOTHING;
