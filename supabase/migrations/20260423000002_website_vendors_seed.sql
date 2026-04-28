-- Seed vendor categories + initial vendor records
-- Derived from apps/opus_website/src/lib/vendors.ts

insert into website_vendor_categories (id, label, display_order, count) values
  ('venues',                   'Venues',                    1, 312),
  ('photographers',            'Photographers',             2, 248),
  ('wedding-planners',         'Wedding Planners',          3, 134),
  ('officiant-mc',             'MC',                        4,  97),
  ('florists',                 'Florists',                  5, 183),
  ('caterers',                 'Caterers',                  6, 209),
  ('hair-makeup',              'Hair & Makeup',             7, 176),
  ('wedding-cakes',            'Wedding Cakes',             8, 118),
  ('transportation',           'Transportation',            9,  74),
  ('djs-bands',                'DJs & Bands',              10, 142),
  ('decor-styling',            'Decor & Styling',          11, 161),
  ('videographers',            'Videographers',            12, 195),
  ('invitations-stationery',   'Invitations & Stationery', 13,  89),
  ('jewellery-rings',          'Jewellery & Rings',        14,  63),
  ('bridal-wear',              'Bridal Wear & Fashion',    15, 107),
  ('sound-lighting',           'Sound & Lighting',         16,  81),
  ('groom-wear',               'Groom Wear',               17,  58),
  ('photo-booths',             'Photo Booths',             18,  44),
  ('honeymoon-travel',         'Honeymoon & Travel',       19,  37),
  ('tents-marquees',           'Tents & Marquees',         20,  52),
  ('security',                 'Security',                 21,  29),
  ('caricature-entertainment', 'Caricature & Entertainment', 22, 33)
on conflict (id) do nothing;

-- Vendors — core fields only; extended fields (pricing, availability, reviews)
-- can be edited via the CMS admin after seeding.
insert into website_vendors (id, slug, name, excerpt, category, category_id, city, price_range, rating, review_count, badge, featured, hero_media) values
  ('zanzibar-pearl-venue', 'zanzibar-pearl-venue', 'The Zanzibar Pearl',
    'Perched on the Indian Ocean with open-air pavilions, private beach access, and unobstructed sunset views, The Zanzibar Pearl offers an all-inclusive wedding experience. Their in-house team handles everything from décor setup and catering coordination to guest transfers and overnight stays, so couples can be fully present on the day.',
    'Venues', 'venues', 'Zanzibar', 'TZS 28M – 60M', 4.9, 84, 'Top Rated', true,
    '{"type":"image","src":"/assets/images/coupleswithpiano.jpg","alt":"Couple at an elegant oceanfront wedding venue"}'::jsonb),

  ('opus-studio', 'opus-studio', 'OpusStudio',
    'Editorial documentary photography that captures atmosphere, not just moments. Based in Dar, available across East Africa.',
    'Photographers', 'photographers', 'Dar es Salaam', 'TZS 7M – 14M', 5.0, 56, 'Top Rated', true,
    '{"type":"image","src":"/assets/images/brideincar.jpg","alt":"Bride portrait by OpusStudio"}'::jsonb),

  ('serengeti-sounds', 'serengeti-sounds', 'Serengeti Sounds',
    'A live band and DJ hybrid that reads the room and keeps energy exactly where it needs to be from cocktails through last dance.',
    'DJs & Bands', 'djs-bands', 'Arusha', 'TZS 4M – 9M', 4.8, 43, 'Verified', true,
    '{"type":"image","src":"/assets/images/mauzo_crew.jpg","alt":"Band performing at a wedding celebration"}'::jsonb),

  ('kilimanjaro-gardens', 'kilimanjaro-gardens', 'Kilimanjaro Gardens',
    'Lush highland gardens with mountain views, a candlelit barn, and capacity for up to 400 guests.',
    'Venues', 'venues', 'Moshi', 'TZS 18M – 38M', 4.7, 61, 'Verified', false,
    '{"type":"image","src":"/assets/images/flowers_pinky.jpg","alt":"Lush garden wedding venue with floral decor"}'::jsonb),

  ('mlimacity-hall', 'mlimacity-hall', 'Mlimacity Hall',
    'A downtown rooftop with panoramic city-and-ocean views, a private bar, and a modern industrial-meets-elegant aesthetic.',
    'Venues', 'venues', 'Dar es Salaam', 'TZS 22M – 45M', 4.6, 38, 'New', false,
    '{"type":"image","src":"/assets/images/authentic_couple.jpg","alt":"Couple at a rooftop wedding venue in Dar es Salaam"}'::jsonb),

  ('amani-lens', 'amani-lens', 'Amani Lens Studio',
    'Warm, cinematic imagery with a focus on candid emotion. Package includes full-day coverage and an edited gallery in 3 weeks.',
    'Photographers', 'photographers', 'Zanzibar', 'TZS 6M – 11M', 4.9, 72, 'Top Rated', false,
    '{"type":"image","src":"/assets/images/beautiful_bride.jpg","alt":"Beautifully lit bridal portrait"}'::jsonb),

  ('golden-hour-studios', 'golden-hour-studios', 'Golden Hour Studios',
    'Specialising in outdoor and destination weddings with natural light and a muted editorial finish.',
    'Photographers', 'photographers', 'Arusha', 'TZS 5M – 9M', 4.7, 29, 'Verified', false,
    '{"type":"image","src":"/assets/images/bridering.jpg","alt":"Engagement ring photography"}'::jsonb),

  ('frame-and-feel', 'frame-and-feel', 'Frame & Feel Films',
    'Cinematic wedding films with drone coverage, same-day edits, and full ceremony documentation.',
    'Videographers', 'videographers', 'Dar es Salaam', 'TZS 5M – 12M', 4.8, 47, 'Top Rated', false,
    '{"type":"image","src":"/assets/images/couples_together.jpg","alt":"Wedding film still from Frame & Feel Films"}'::jsonb),

  ('safari-cinema', 'safari-cinema', 'Safari Cinema',
    'Feature-style wedding documentaries for destination and outdoor ceremonies. Based in Arusha.',
    'Videographers', 'videographers', 'Arusha', 'TZS 6M – 14M', 4.6, 22, 'Verified', false,
    '{"type":"image","src":"/assets/images/cutesy_couple.jpg","alt":"Couple during a cinematic outdoor shoot"}'::jsonb),

  ('bloom-collective', 'bloom-collective', 'The Bloom Collective',
    'Full décor and floristry with a signature style: sculptural arches, lush tablescapes, and ceremony installations.',
    'Florists', 'florists', 'Dar es Salaam', 'TZS 4M – 16M', 4.9, 65, 'Top Rated', false,
    '{"type":"image","src":"/assets/images/flowers_pinky.jpg","alt":"Lush floral wedding installation"}'::jsonb),

  ('spice-route-catering', 'spice-route-catering', 'Spice Route Catering',
    'Swahili-fusion menus for 80 to 500 guests. Free tasting sessions, full service staff, and custom menu design.',
    'Caterers', 'caterers', 'Zanzibar', 'TZS 12M – 35M', 4.8, 91, 'Top Rated', false,
    '{"type":"image","src":"/assets/images/churchcouples.jpg","alt":"Guests at a beautifully catered wedding reception"}'::jsonb),

  ('luminary-glam', 'luminary-glam', 'Luminary Glam Studio',
    'Bridal hair and makeup with a polished editorial finish. Trials included with every full-day package.',
    'Hair & Makeup', 'hair-makeup', 'Dar es Salaam', 'TZS 1.5M – 4M', 4.8, 58, 'Top Rated', false,
    '{"type":"image","src":"/assets/images/beautyinbride.jpg","alt":"Bride with polished hair and makeup on wedding day"}'::jsonb),

  ('glow-collective', 'glow-collective', 'Glow Collective',
    'A mobile beauty team serving the whole bridal party. Available across Zanzibar and the mainland.',
    'Hair & Makeup', 'hair-makeup', 'Zanzibar', 'TZS 2M – 5M', 4.7, 41, 'Verified', false,
    '{"type":"image","src":"/assets/images/bridewithumbrella.jpg","alt":"Bridal party ready for the wedding day"}'::jsonb),

  ('rhythm-house', 'rhythm-house', 'Rhythm House',
    'Dar''s top wedding DJ: curated playlists, seamless transitions, and a light rig that transforms any room after dark.',
    'DJs & Bands', 'djs-bands', 'Dar es Salaam', 'TZS 2.5M – 7M', 4.9, 112, 'Top Rated', false,
    '{"type":"image","src":"/assets/images/mauzo_crew.jpg","alt":"DJ performing at an energetic wedding reception"}'::jsonb),

  ('east-africa-sounds', 'east-africa-sounds', 'East Africa Sounds',
    'Afrobeats, Bongo Flava, and international sets — a three-piece live band that keeps the dance floor moving all night.',
    'DJs & Bands', 'djs-bands', 'Zanzibar', 'TZS 5M – 11M', 4.7, 39, 'Verified', false,
    '{"type":"image","src":"/assets/images/churchcouples.jpg","alt":"Live band at a wedding celebration"}'::jsonb),

  ('petals-and-palms', 'petals-and-palms', 'Petals & Palms',
    'Tropical floristry with a modern edit. Known for dramatic ceremony arches, boutonnieres, and overflowing tablescapes.',
    'Florists', 'florists', 'Dar es Salaam', 'TZS 3M – 10M', 4.8, 47, 'Verified', false,
    '{"type":"image","src":"/assets/images/flowers_pinky.jpg","alt":"Tropical floral wedding arrangement"}'::jsonb),

  ('wild-bloom-studio', 'wild-bloom-studio', 'Wild Bloom Studio',
    'Garden-style floristry with an organic, slightly undone feel. Specialises in outdoor and highland ceremonies.',
    'Florists', 'florists', 'Arusha', 'TZS 2.5M – 8M', 4.6, 28, 'New', false,
    '{"type":"image","src":"/assets/images/hand_rings.jpg","alt":"Delicate floral details at a garden wedding"}'::jsonb),

  ('boma-kitchen', 'boma-kitchen', 'Boma Kitchen',
    'East African cuisine at its most celebratory. Buffet and plated service for 50 to 800 guests, with a full bar package option.',
    'Caterers', 'caterers', 'Arusha', 'TZS 8M – 22M', 4.7, 63, 'Verified', false,
    '{"type":"image","src":"/assets/images/couples_together.jpg","alt":"Catered wedding reception with guests enjoying the meal"}'::jsonb),

  ('coastal-table', 'coastal-table', 'Coastal Table',
    'Seafood-led menus with Swahili spice influence. Perfect for beachfront and outdoor receptions up to 300 guests.',
    'Caterers', 'caterers', 'Moshi', 'TZS 10M – 28M', 4.8, 44, 'Top Rated', false,
    '{"type":"image","src":"/assets/images/cutesy_couple.jpg","alt":"Outdoor coastal wedding reception"}'::jsonb)
on conflict (id) do nothing;
