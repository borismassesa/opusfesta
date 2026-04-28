-- Reshape Advice & Ideas page chrome rows to match the live editorial layout
-- (AdviceHero + topic strip/grid + Editor's Picks/Loved/Favorites/Latest/Search headers).
-- Removes the old `sections` and `cta` rows (they don't exist in the new layout)
-- and replaces hero/topics/section_headers content with the new schema.

DELETE FROM website_page_sections
WHERE page_key = 'advice-and-ideas'
  AND section_key IN ('sections', 'cta');

UPDATE website_page_sections SET content = '{
  "headline_prefix": "Plan a wedding",
  "headline_suffix_prefix": "that feels",
  "rotating_words": ["unforgettable","cinematic","effortless","intentional","coastal","timeless","romantic ♥","personal","warm"],
  "subheadline": "Real celebrations, honest planning advice, and the ideas worth borrowing. Gathered for couples building a wedding that feels unmistakably their own.",
  "primary_cta_label": "Start reading",
  "primary_cta_href": "#editor-picks",
  "secondary_cta_label": "Latest stories",
  "secondary_cta_href": "#latest-stories"
}'::jsonb, draft_content = NULL
WHERE page_key = 'advice-and-ideas' AND section_key = 'hero';

UPDATE website_page_sections SET content = '{
  "items": [
    {"id":"featured-stories","label":"Featured Stories","description":"Editor picks, sharp ideas, and standout inspiration.","cover_image_url":"/assets/images/coupleswithpiano.jpg"},
    {"id":"planning-guides","label":"Planning Guides","description":"Timelines, vendor strategy, and practical decision making.","cover_image_url":"/assets/images/brideincar.jpg"},
    {"id":"real-weddings","label":"Real Weddings","description":"Celebrations that feel personal, stylish, and deeply local.","cover_image_url":"/assets/images/authentic_couple.jpg"},
    {"id":"themes-styles","label":"Themes & Styles","description":"Moodboards, palettes, looks, and atmosphere.","cover_image_url":"/assets/images/flowers_pinky.jpg"},
    {"id":"etiquette-wording","label":"Etiquette & Wording","description":"Guest communication, boundaries, and graceful scripts.","cover_image_url":"/assets/images/hand_rings.jpg"},
    {"id":"bridal-shower-ideas","label":"Bridal Shower Ideas","description":"Modern ways to host pre-wedding celebrations.","cover_image_url":"/assets/images/mauzo_crew.jpg"},
    {"id":"honeymoon-ideas","label":"Honeymoon Ideas","description":"Escapes, soft landings, and memorable mini-moons.","cover_image_url":"/assets/images/bride_umbrella.jpg"}
  ]
}'::jsonb, draft_content = NULL
WHERE page_key = 'advice-and-ideas' AND section_key = 'topics';

INSERT INTO website_page_sections (page_key, section_key, content, sort_order) VALUES (
  'advice-and-ideas', 'section_headers',
  '{
    "editor_picks": {
      "title": "Our editor\u2019s picks",
      "subtitle": "Welcome to the inspiration stage. The latest advice and trending ideas to help you design the best day ever.",
      "view_all_label": "View all",
      "view_all_href": "/advice-and-ideas#latest-stories",
      "mobile_cta_label": "View all articles"
    },
    "popular_topics": { "title": "Popular Topics" },
    "loved_by_couples": {
      "title": "Loved by Couples",
      "subtitle": "Expert tips, tricks, and wedding planning ideas our readers keep coming back to.",
      "view_all_label": "View all",
      "view_all_href": "/advice-and-ideas#latest-stories",
      "cta_label": "Read story"
    },
    "favorites": {
      "title": "Our Favorites",
      "subtitle": "The OpusFesta editorial team. Fashion editors, honeymoon writers, and etiquette voices share their stories of the moment.",
      "view_all_label": "View all",
      "view_all_href": "/advice-and-ideas#latest-stories",
      "cta_label": "Read story"
    },
    "latest_stories": {
      "id": "latest-stories",
      "title": "Latest Stories",
      "subtitle": "Fresh planning advice, style notes, and real wedding stories from across the OpusFesta journal."
    },
    "search": {
      "eyebrow": "Search results",
      "no_results_headline": "No stories match \u201c{query}\u201d",
      "no_results_body": "Try a shorter query, a different keyword, or browse topics from the nav above.",
      "clear_label": "\u2190 Clear search",
      "back_label": "Back to the hub"
    }
  }'::jsonb,
  3
) ON CONFLICT (page_key, section_key) DO UPDATE
  SET content = EXCLUDED.content, draft_content = NULL;
