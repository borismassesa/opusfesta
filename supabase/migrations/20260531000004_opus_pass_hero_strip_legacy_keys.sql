-- The OpusPass homepage hero was redesigned to the shared LandingHero, which
-- dropped the old two-card fields. Strip the now-dead keys from the stored CMS
-- content so they no longer linger in the row (or leak into the RSC payload).
-- The new fields (trust_count, rating, avatars, featured_in) fall back to code
-- defaults until an editor publishes them.

UPDATE website_page_sections
SET
  content = content
    - 'main_image_url' - 'card_image_url' - 'card_heading' - 'card_link_label' - 'card_href',
  draft_content = CASE
    WHEN draft_content IS NULL THEN NULL
    ELSE draft_content
      - 'main_image_url' - 'card_image_url' - 'card_heading' - 'card_link_label' - 'card_href'
  END
WHERE page_key = 'opus-pass-homepage' AND section_key = 'hero';
