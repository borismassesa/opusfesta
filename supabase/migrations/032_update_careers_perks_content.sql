-- Update careers page perks section in database
-- Changes:
-- 1. Update headline from "Perks & benefits" to "The upside"
-- 2. Remove "Commuter benefits" and "Monthly stipend" perks
-- 3. Keep only 6 perks

UPDATE cms_pages
SET 
  draft_content = jsonb_set(
    jsonb_set(
      draft_content,
      '{perks,headline}',
      '"The upside"'
    ),
    '{perks,items}',
    '[
      {
        "title": "Medical, dental & vision",
        "description": "We offer competitive medical, dental, vision insurance for employees and dependents. This includes medical, dental, and vision premiums.",
        "icon": "🏥"
      },
      {
        "title": "Time off",
        "description": "We want you to take time off to rest and rejuvenate. OpusFesta offers flexible paid vacation as well as 10+ observed holidays by country.",
        "icon": "☂️"
      },
      {
        "title": "Mental health & wellbeing",
        "description": "You and your dependents will have access to providers that create personalized treatment plans, including therapy, coaching, medication management, and EAP services.",
        "icon": "❤️"
      },
      {
        "title": "Parental leave",
        "description": "We offer biological, adoptive, and foster parents paid time off to spend quality time with family.",
        "icon": "👶"
      },
      {
        "title": "Fertility coverage",
        "description": "Our fertility benefit gives you employer-sponsored funds you can use to pay for fertility treatments and family-forming services.",
        "icon": "💝"
      },
      {
        "title": "Retirement matching",
        "description": "OpusFesta makes it easy to save money for retirement. There''s also employer matching!",
        "icon": "🐷"
      }
    ]'::jsonb
  ),
  updated_at = NOW()
WHERE slug = 'careers'
  AND draft_content IS NOT NULL;

-- Also update published_content if it exists
UPDATE cms_pages
SET 
  published_content = jsonb_set(
    jsonb_set(
      published_content,
      '{perks,headline}',
      '"The upside"'
    ),
    '{perks,items}',
    '[
      {
        "title": "Medical, dental & vision",
        "description": "We offer competitive medical, dental, vision insurance for employees and dependents. This includes medical, dental, and vision premiums.",
        "icon": "🏥"
      },
      {
        "title": "Time off",
        "description": "We want you to take time off to rest and rejuvenate. OpusFesta offers flexible paid vacation as well as 10+ observed holidays by country.",
        "icon": "☂️"
      },
      {
        "title": "Mental health & wellbeing",
        "description": "You and your dependents will have access to providers that create personalized treatment plans, including therapy, coaching, medication management, and EAP services.",
        "icon": "❤️"
      },
      {
        "title": "Parental leave",
        "description": "We offer biological, adoptive, and foster parents paid time off to spend quality time with family.",
        "icon": "👶"
      },
      {
        "title": "Fertility coverage",
        "description": "Our fertility benefit gives you employer-sponsored funds you can use to pay for fertility treatments and family-forming services.",
        "icon": "💝"
      },
      {
        "title": "Retirement matching",
        "description": "OpusFesta makes it easy to save money for retirement. There''s also employer matching!",
        "icon": "🐷"
      }
    ]'::jsonb
  ),
  updated_at = NOW()
WHERE slug = 'careers'
  AND published_content IS NOT NULL;
