-- Seed empty CMS rows for the OpusPass Guests & RSVPs landing page sections so
-- the admin CMS lists them on first load. Content fallbacks live in code
-- (apps/opus_pass/src/lib/cms/guests-*.ts and the matching
-- apps/opus_admin/src/lib/cms/opus-pass-guests-*.ts). An empty '{}' content row
-- renders the code fallback until an editor saves and publishes real content.

INSERT INTO website_page_sections (page_key, section_key, content, draft_content, is_published, sort_order)
VALUES
  ('opus-pass-guests', 'hero',           '{}'::jsonb, NULL, false, 0),
  ('opus-pass-guests', 'features',       '{}'::jsonb, NULL, false, 1),
  ('opus-pass-guests', 'spread-the-joy', '{}'::jsonb, NULL, false, 2),
  ('opus-pass-guests', 'faqs',           '{}'::jsonb, NULL, false, 3)
ON CONFLICT (page_key, section_key) DO NOTHING;
