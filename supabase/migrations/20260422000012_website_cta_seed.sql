-- Seed CTA section with current hardcoded content
-- from apps/opus_website/src/components/cta.tsx

insert into website_page_sections (page_key, section_key, content, sort_order) values
(
  'home', 'cta',
  '{
    "background_image_url": "/assets/images/brideincar.jpg",
    "eyebrow": "Free to start. Always.",
    "headline_line_1": "Your perfect",
    "headline_line_2": "day starts",
    "headline_line_3": "right here.",
    "subheadline": "Join thousands of couples across East Africa planning their dream wedding, stress-free.",
    "cta_label": "Start planning for free",
    "cta_href": "#",
    "footnote": "No credit card required · Set up in minutes"
  }'::jsonb,
  11
)
on conflict (page_key, section_key) do nothing;
