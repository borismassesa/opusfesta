-- Seed empty CMS rows for the OpusPass homepage sections added in the redesign
-- (Photo Showcase, Why OpusPass, Manifesto) so the admin CMS lists them on first
-- load. Content fallbacks live in code (apps/opus_pass/src/lib/cms/homepage-*.ts
-- and the matching apps/opus_admin/src/lib/cms/opus-pass-homepage-*.ts). An empty
-- '{}' content row renders the code fallback until an editor publishes content.

INSERT INTO website_page_sections (page_key, section_key, content, draft_content, is_published, sort_order)
VALUES
  ('opus-pass-homepage', 'showcase',      '{}'::jsonb, NULL, false, 1),
  ('opus-pass-homepage', 'why-opus-pass', '{}'::jsonb, NULL, false, 2),
  ('opus-pass-homepage', 'manifesto',     '{}'::jsonb, NULL, false, 5)
ON CONFLICT (page_key, section_key) DO NOTHING;
