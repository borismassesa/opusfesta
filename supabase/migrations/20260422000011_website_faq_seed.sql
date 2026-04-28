-- Seed FAQ section with current hardcoded Q&A
-- from apps/opus_website/src/components/faq.tsx

insert into website_page_sections (page_key, section_key, content, sort_order) values
(
  'home', 'faq',
  '{
    "eyebrow": "Support",
    "headline_line_1": "Every",
    "headline_line_2": "answer",
    "headline_line_3": "you need.",
    "subheadline": "Can''t find what you''re looking for? Our team is happy to help.",
    "cta_label": "Talk to us",
    "cta_href": "#",
    "items": [
      { "id": "q1", "q": "Is OpusFesta free to use?", "a": "Yes, completely free to start. Create your wedding website, manage your guest list, and browse vendors at no cost. No credit card required." },
      { "id": "q2", "q": "How do I find vendors in my city?", "a": "Search by category and location. We have verified vendors across Tanzania: Dar es Salaam, Zanzibar, Arusha, Moshi, Mwanza, and Dodoma. Every vendor is reviewed before appearing in results." },
      { "id": "q3", "q": "Can I message vendors directly?", "a": "Yes. Send enquiries, discuss packages, and confirm bookings all within OpusFesta. No hunting for WhatsApp numbers or email addresses." },
      { "id": "q4", "q": "How does the wedding website work?", "a": "Get a personalised wedding website in minutes. Share your story, collect RSVPs, and keep guests updated with a custom link like sarahandjames.opusfesta.com." },
      { "id": "q5", "q": "Is my data safe?", "a": "Yes. Your personal information and guest data are encrypted and never shared with third parties. You control what you share and with whom." },
      { "id": "q6", "q": "Can vendors join OpusFesta?", "a": "Absolutely. Create a vendor profile, showcase your portfolio, manage bookings, and get discovered by couples actively planning. Join and grow your business." }
    ]
  }'::jsonb,
  10
)
on conflict (page_key, section_key) do nothing;
