-- Seed empty CMS rows for the 5 OpusPass dashboard hero sections so the
-- admin CMS lists them on first load. Content fallbacks live in code
-- (apps/opus_pass/src/lib/cms/dashboard-hero.ts and the matching
-- apps/opus_admin/src/lib/cms/opus-pass-dashboard-hero.ts).

INSERT INTO website_page_sections (page_key, section_key, content, draft_content, is_published, sort_order)
VALUES
  ('opus-pass-dashboard-home', 'hero', '{}'::jsonb, NULL, false, 0),
  ('opus-pass-dashboard-invitations', 'hero', '{}'::jsonb, NULL, false, 0),
  ('opus-pass-dashboard-guests', 'hero', '{}'::jsonb, NULL, false, 0),
  ('opus-pass-dashboard-rsvps', 'hero', '{}'::jsonb, NULL, false, 0),
  ('opus-pass-dashboard-website', 'hero', '{}'::jsonb, NULL, false, 0)
ON CONFLICT (page_key, section_key) DO NOTHING;
