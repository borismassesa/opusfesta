-- Seed Trust Bar section with current hardcoded content from apps/opus_website/src/components/trust.tsx

insert into website_page_sections (page_key, section_key, content, sort_order) values
(
  'home', 'trust',
  '{
    "items": [
      {
        "id": "trusted",
        "icon": "users",
        "title": "Trusted by millions planning weddings",
        "description": "We help plan over 2 million weddings worldwide every year"
      },
      {
        "id": "verified",
        "icon": "landmark",
        "title": "Verified Vendors",
        "description": "OpusFesta features only verified, highly-reviewed wedding professionals in your area"
      },
      {
        "id": "support",
        "icon": "headset",
        "title": "24/7 expert support",
        "description": "Get help from our wedding concierges anytime over email, phone and chat"
      }
    ]
  }'::jsonb,
  2
)
on conflict (page_key, section_key) do nothing;
