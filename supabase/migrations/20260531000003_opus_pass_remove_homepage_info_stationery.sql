-- Remove the orphaned OpusPass homepage CMS sections "info" (About OpusPass) and
-- "stationery" (Wedding Suite). After the homepage redesign these components are
-- no longer rendered, and their loaders/editors have been deleted from the code
-- (OF-ADM-0021). Drop their CMS rows so they no longer surface anywhere.

DELETE FROM website_page_sections
WHERE page_key = 'opus-pass-homepage'
  AND section_key IN ('info', 'stationery');
