-- Seed initial content rows for the Attire & Rings page CMS.
-- Uses INSERT ... ON CONFLICT DO NOTHING so re-running is safe once
-- admins have published real content.

INSERT INTO website_page_sections (page_key, section_key, content, is_published, sort_order)
VALUES
  ('attire-and-rings', 'hero', '{
    "headline": "Find your perfect attire & rings",
    "description": "Curated wedding dresses, tailored suits, and timeless engagement rings from trusted Tanzanian boutiques.",
    "cta_label": "Shop the bridal collection",
    "cta_href": "/attire-and-rings/bridal-collection",
    "main_image_url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    "card_image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80",
    "card_heading": "Meet our top bridal vendors",
    "card_link_label": "Discover",
    "card_href": "/attire-and-rings/bridal-collection"
  }', true, 1),

  ('attire-and-rings', 'categories', '{
    "title": "Discover trending wedding attire & rings",
    "items": [
      {"id": "1", "name": "Diamond Rings", "img": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80"},
      {"id": "2", "name": "Men''s Tuxedos", "img": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80"},
      {"id": "3", "name": "Lace Dresses", "img": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80"},
      {"id": "4", "name": "Wedding Bands", "img": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80"},
      {"id": "5", "name": "Bridal Accessories", "img": "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80"},
      {"id": "6", "name": "Bridesmaid Gowns", "img": "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=400&q=80"}
    ]
  }', true, 2),

  ('attire-and-rings', 'gift-section', '{
    "heading": "OpusFesta-special rings & wedding attire",
    "cta_label": "Get inspired",
    "gifts": [
      {"id": "1", "name": "Diamond Engagement Rings", "img": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80"},
      {"id": "2", "name": "Vintage Wedding Dresses", "img": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"},
      {"id": "3", "name": "Designer Tuxedos", "img": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80"}
    ]
  }', true, 3),

  ('attire-and-rings', 'accessories', '{
    "heading": "Accessories to complete the look",
    "items": [
      {"id": "1", "name": "Bridal Veils", "img": "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=200&q=80"},
      {"id": "2", "name": "Wedding Shoes", "img": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&q=80"},
      {"id": "3", "name": "Groom Watches", "img": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80"},
      {"id": "4", "name": "Bridesmaid Dresses", "img": "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=200&q=80"},
      {"id": "5", "name": "Groomsmen Ties", "img": "https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=200&q=80"}
    ]
  }', true, 4),

  ('attire-and-rings', 'loved-categories', '{
    "title": "Shop our most-loved categories",
    "items": [
      {"id": "1", "name": "Wedding Dresses", "img": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80"},
      {"id": "2", "name": "Groom Suits", "img": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80"},
      {"id": "3", "name": "Engagement Rings", "img": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80"},
      {"id": "4", "name": "Wedding Bands", "img": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80"},
      {"id": "5", "name": "Bridal Shoes", "img": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80"},
      {"id": "6", "name": "Veils & Headpieces", "img": "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80"}
    ]
  }', true, 5),

  ('attire-and-rings', 'deals', '{
    "heading": "Today''s big deals",
    "items": [
      {"id": "1", "name": "Vintage Gold Wedding Band", "rating": "5.0", "price": "TZS 499,000", "old_price": "TZS 760,000", "discount": "35% off", "badge_text": "Biggest sale in 60+ days", "img": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80"},
      {"id": "2", "name": "Custom Engraved Men''s Band", "rating": "4.8", "price": "TZS 156,000", "old_price": "TZS 208,000", "discount": "25% off", "badge_text": "Biggest sale in 60+ days", "img": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80"},
      {"id": "3", "name": "Bohemian Lace Wedding Dress", "rating": "4.8", "price": "TZS 495,000", "old_price": "TZS 661,000", "discount": "25% off", "badge_text": "Biggest sale in 60+ days", "img": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"},
      {"id": "4", "name": "Classic Navy Blue Suit", "rating": "4.9", "price": "TZS 265,000", "old_price": "TZS 410,000", "discount": "40% off", "badge_text": "Biggest sale in 60+ days", "img": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80"}
    ]
  }', true, 6),

  ('attire-and-rings', 'editors-picks', '{
    "eyebrow": "Editors'' Picks",
    "heading": "Bridal & Accessories Favourites",
    "cta_label": "Shop these unique finds",
    "footer_text": "Your one-stop shop for wedding attire, rings, and accessories",
    "row1": [
      {"id": "1", "img": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80", "has_video": true, "has_heart": false, "price": ""},
      {"id": "2", "img": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80", "has_video": false, "has_heart": false, "price": ""},
      {"id": "3", "img": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80", "has_video": false, "has_heart": false, "price": ""}
    ],
    "row2": [
      {"id": "4", "img": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80", "has_video": true, "has_heart": false, "price": ""},
      {"id": "5", "img": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80", "has_video": false, "has_heart": true, "price": "TZS 2,298,000"},
      {"id": "6", "img": "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80", "has_video": true, "has_heart": false, "price": ""}
    ]
  }', true, 7),

  ('attire-and-rings', 'standout-styles', '{
    "heading": "Save now on standout styles",
    "items": [
      {"id": "1", "name": "Diamond Rings", "discount": "up to 20% off", "img": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80"},
      {"id": "2", "name": "Wedding Dresses", "discount": "up to 20% off", "img": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"},
      {"id": "3", "name": "Groom Suits", "discount": "up to 20% off", "img": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80"},
      {"id": "4", "name": "Bridal Shoes", "discount": "up to 20% off", "img": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"},
      {"id": "5", "name": "Wedding Bands", "discount": "up to 20% off", "img": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80"}
    ]
  }', true, 8),

  ('attire-and-rings', 'local-shops', '{
    "eyebrow": "Local finds? OpusFesta has it.",
    "heading": "Discover shops in your area",
    "cta_label": "Shop from local makers",
    "shops": [
      {"id": "1", "name": "Boutique Bridal", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", "img": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"},
      {"id": "2", "name": "Diamond District", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", "img": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"},
      {"id": "3", "name": "Savile Row Suits", "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", "img": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80"}
    ]
  }', true, 9),

  ('attire-and-rings', 'blog', '{
    "heading": "Fresh from the blog",
    "articles": [
      {"id": "1", "tag": "Bridal Wear", "title": "15 stunning wedding dress trends for 2026 brides", "excerpt": "Make your big day even more special with our curated selection of breathtaking bridal gowns that capture the modern romance.", "img": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"},
      {"id": "2", "tag": "Jewelry Guides", "title": "How to pick the perfect engagement ring", "excerpt": "From diamond cuts and clarity to selecting the perfect band style — get ready to choose an engagement ring that lasts forever.", "img": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80"},
      {"id": "3", "tag": "Suiting", "title": "The ultimate guide to groom and groomsmen attire", "excerpt": "Get to know the artistry behind a perfectly tailored suit, from fabric selection to the sharpest lapel styles.", "img": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80"}
    ]
  }', true, 10)
ON CONFLICT (page_key, section_key) DO NOTHING;
