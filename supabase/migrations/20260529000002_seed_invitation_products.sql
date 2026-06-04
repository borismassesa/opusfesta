-- Seed / upsert all 24 invitation products from the former bundled TypeScript data file.
-- Slug is derived from the product name (lowercase, hyphens).  Static /assets/ paths are
-- stored as image_url so designers can replace them via the CMS upload tool later.

INSERT INTO website_invitations_products
  (id, slug, name, designer, category, price_was, price_now, digital_unit_price,
   free_sample, swatches, palettes, treatment, image_url, back_image_url, gallery,
   published, sort_order)
VALUES
  (
    'p1', 'botanical-frame-wedding-invitations', 'Botanical Frame Wedding Invitations',
    'Bagamoyo Press', 'Wedding Invitations', 199000, 119000, 10000, true,
    '["#A6B89A","#F5DCE2","#FBF7F2","#1A1A1A","#7A1F2B"]'::jsonb,
    '[
      {"name":"Sage Green","background":"#FBF7F2","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"#7A8A6E"},
      {"name":"Blush Pink","background":"#FDF5F7","surface":"#FDF5F7","accent":"#F5DCE2","textPrimary":"#1A1A1A","textSecondary":"#A84F66","muted":"#C07080"},
      {"name":"Ivory","background":"#FBF7F2","surface":"#FBF7F2","accent":"#D8CFC4","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Onyx","background":"#F0EEE9","surface":"#F0EEE9","accent":"#1A1A1A","textPrimary":"#1A1A1A","textSecondary":"#3A3A3A","muted":"#6B6B6B"},
      {"name":"Deep Red","background":"#FBF2F0","surface":"#FBF2F0","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.65)"}
    ]'::jsonb,
    'floral-border', '/assets/invitation-svgs/floral-border.svg', '', '[]'::jsonb,
    true, 1
  ),
  (
    'p2', 'heritage-crown-karibu-invitations', 'Heritage Crown Karibu Invitations',
    'House of Mwakali', 'Wedding Invitations', 215000, 129000, 12000, true,
    '["#7A1F2B","#C8A35C","#F5EFE3","#1A1A1A"]'::jsonb,
    '[
      {"name":"Heritage Red","background":"#7A1F2B","surface":"#7A1F2B","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.8)"},
      {"name":"Midnight Gold","background":"#1A1208","surface":"#1A1208","accent":"#C8A35C","textPrimary":"#FBF5E8","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.75)"},
      {"name":"Cream & Crimson","background":"#F5EFE3","surface":"#F5EFE3","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.7)"},
      {"name":"Onyx Gold","background":"#1A1A1A","surface":"#1A1A1A","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.7)"}
    ]'::jsonb,
    'cultural-red', '/assets/invitation-svgs/cultural-red.svg', '',
    '["/assets/invitation-svgs/model-wedding-package/ticket-front.svg"]'::jsonb,
    true, 2
  ),
  (
    'p3', 'modern-block-all-in-one-invitations', 'Modern Block All-in-one Invitations',
    'Studio Saba', 'All-in-One Wedding Invitations', null, 132000, 11000, false,
    '["#1A1A1A","#FBF7F2","#E8D9A7"]'::jsonb,
    '[
      {"name":"Onyx","background":"#FFFFFF","surface":"#1A1A1A","accent":"#1A1A1A","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.6)","muted":"rgba(255,255,255,0.6)"},
      {"name":"Ivory","background":"#FBF7F2","surface":"#F0EDE5","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Warm Gold","background":"#FBF5E8","surface":"#E8D9A7","accent":"#C8A35C","textPrimary":"#1A1A1A","textSecondary":"#7A6030","muted":"#A8884C"}
    ]'::jsonb,
    'modern-block', '', '', '[]'::jsonb,
    true, 3
  ),
  (
    'p4', 'arch-script-save-the-date-cards', 'Arch Script Save the Date Cards',
    'Mzimbazi Studio', 'Save the Dates', null, 98000, 8000, true,
    '["#7A1F2B","#F5EFE3","#A6B89A"]'::jsonb,
    '[
      {"name":"Deep Red","background":"#F5EFE3","surface":"#F5EFE3","accent":"#7A1F2B","textPrimary":"#7A1F2B","textSecondary":"rgba(122,31,43,0.8)","muted":"rgba(122,31,43,0.6)"},
      {"name":"Cream","background":"#F5EFE3","surface":"#F5EFE3","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Sage Green","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"}
    ]'::jsonb,
    'arch-script', '', '', '[]'::jsonb,
    true, 4
  ),
  (
    'p5', 'sage-panel-engagement-invitations', 'Sage Panel Engagement Invitations',
    'Pwani Paper Co.', 'Engagement Invitations', 165000, 99000, 10000, true,
    '["#A6B89A","#FBF7F2","#5C6B4D"]'::jsonb,
    '[
      {"name":"Sage Panel","background":"#A6B89A","surface":"#FBF7F2","accent":"#5C6B4D","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"rgba(92,107,77,0.7)"},
      {"name":"Ivory","background":"#FBF7F2","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"#7A8A6E"},
      {"name":"Forest","background":"#5C6B4D","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#F5F2EC","textSecondary":"rgba(245,242,236,0.8)","muted":"rgba(245,242,236,0.6)"}
    ]'::jsonb,
    'sage-panel', '', '', '[]'::jsonb,
    true, 5
  ),
  (
    'p6', 'navy-and-gold-classic-invitations', 'Navy & Gold Classic Invitations',
    'Studio Saba', 'Wedding Invitations', null, 189000, 12000, false,
    '["#1E2D54","#E8D9A7","#F5EFE3","#C8A35C"]'::jsonb,
    '[
      {"name":"Navy & Gold","background":"#1E2D54","surface":"#1E2D54","accent":"#E8D9A7","textPrimary":"#F5EFE3","textSecondary":"#E8D9A7","muted":"rgba(232,217,167,0.7)"},
      {"name":"Champagne","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#1E2D54","textSecondary":"#2E4080","muted":"rgba(30,45,84,0.6)"},
      {"name":"Ivory & Navy","background":"#F5EFE3","surface":"#F5EFE3","accent":"#1E2D54","textPrimary":"#1E2D54","textSecondary":"#2E4080","muted":"rgba(30,45,84,0.55)"},
      {"name":"Midnight Gold","background":"#1A1208","surface":"#1A1208","accent":"#C8A35C","textPrimary":"#FBF5E8","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.7)"}
    ]'::jsonb,
    'navy-gold', '/assets/invitation-svgs/navy-gold.svg', '', '[]'::jsonb,
    true, 6
  ),
  (
    'p7', 'minimal-line-modern-invitations', 'Minimal Line Modern Invitations',
    'Bagamoyo Press', 'Wedding Invitations', null, 112000, 9000, true,
    '["#FFFFFF","#1A1A1A","#A6B89A"]'::jsonb,
    '[
      {"name":"White","background":"#FFFFFF","surface":"#FFFFFF","accent":"#1A1A1A","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Onyx","background":"#1A1A1A","surface":"#1A1A1A","accent":"#FFFFFF","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.7)","muted":"rgba(255,255,255,0.5)"},
      {"name":"Sage","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"}
    ]'::jsonb,
    'minimal-line', '', '', '[]'::jsonb,
    true, 7
  ),
  (
    'p8', 'blush-frame-bridal-shower-invitations', 'Blush Frame Bridal Shower Invitations',
    'House of Mwakali', 'Bridal Shower Invitations', 145000, 87000, 9000, true,
    '["#F5DCE2","#A84F66","#7A1F2B","#FBF7F2"]'::jsonb,
    '[
      {"name":"Blush","background":"#F5DCE2","surface":"#FFFFFF","accent":"#A84F66","textPrimary":"#7A1F2B","textSecondary":"#A84F66","muted":"#A84F66"},
      {"name":"Rose","background":"#FDF0F3","surface":"#FFFFFF","accent":"#A84F66","textPrimary":"#A84F66","textSecondary":"#C07080","muted":"rgba(168,79,102,0.6)"},
      {"name":"Deep Red","background":"#7A1F2B","surface":"#FFFFFF","accent":"#F5DCE2","textPrimary":"#7A1F2B","textSecondary":"#A84F66","muted":"#C07080"},
      {"name":"Ivory","background":"#FBF7F2","surface":"#FFFFFF","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"}
    ]'::jsonb,
    'blush-frame', '', '', '[]'::jsonb,
    true, 8
  ),
  (
    'p9', 'two-of-us-photo-save-the-date-cards', 'Two of Us Photo Save the Date Cards',
    'Lake Manyara Press', 'Save the Dates', null, 167000, 12000, false,
    '["#1A1A1A","#F5EFE3","#A6B89A"]'::jsonb,
    '[
      {"name":"Dark Overlay","background":"transparent","surface":"rgba(0,0,0,0.35)","accent":"rgba(255,255,255,0.6)","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.8)","muted":"rgba(255,255,255,0.7)"},
      {"name":"Soft Cream","background":"transparent","surface":"rgba(245,239,227,0.55)","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Sage Wash","background":"transparent","surface":"rgba(166,184,154,0.45)","accent":"#5C6B4D","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.85)","muted":"rgba(255,255,255,0.65)"}
    ]'::jsonb,
    'photo-overlay', '', '', '[]'::jsonb,
    true, 9
  ),
  (
    'p10', 'classic-serif-cream-invitations', 'Classic Serif Cream Invitations',
    'Pwani Paper Co.', 'Wedding Invitations', 139000, 83000, 10000, true,
    '["#F5EFE3","#1A1A1A","#A6B89A","#C8A35C"]'::jsonb,
    '[
      {"name":"Classic Cream","background":"#F5EFE3","surface":"#F5EFE3","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Onyx","background":"#1A1A1A","surface":"#2A2A2A","accent":"#6B6B6B","textPrimary":"#F5EFE3","textSecondary":"#C4B9A8","muted":"#8D8D8D"},
      {"name":"Sage","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"},
      {"name":"Warm Gold","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#2B1F0A","textSecondary":"#7A6030","muted":"#A8884C"}
    ]'::jsonb,
    'classic-serif', '/assets/invitation-svgs/classic-serif.svg', '', '[]'::jsonb,
    true, 10
  ),
  (
    'p11', 'botanical-frame-save-the-date-cards', 'Botanical Frame Save the Date Cards',
    'Mzimbazi Studio', 'Save the Dates', null, 92000, 8000, true,
    '["#A6B89A","#F5DCE2","#FBF7F2"]'::jsonb,
    '[
      {"name":"Sage Green","background":"#FBF7F2","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"#7A8A6E"},
      {"name":"Blush Pink","background":"#FDF5F7","surface":"#FDF5F7","accent":"#F5DCE2","textPrimary":"#1A1A1A","textSecondary":"#A84F66","muted":"#C07080"},
      {"name":"Ivory","background":"#FBF7F2","surface":"#FBF7F2","accent":"#D8CFC4","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"}
    ]'::jsonb,
    'floral-border', '', '', '[]'::jsonb,
    true, 11
  ),
  (
    'p12', 'heritage-karibu-reception-cards', 'Heritage Karibu Reception Cards',
    'Studio Saba', 'Reception Cards', null, 156000, 11000, false,
    '["#7A1F2B","#C8A35C","#F5EFE3"]'::jsonb,
    '[
      {"name":"Heritage Red","background":"#7A1F2B","surface":"#7A1F2B","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.8)"},
      {"name":"Warm Gold","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#2B1F0A","textSecondary":"#7A6030","muted":"#A8884C"},
      {"name":"Cream & Crimson","background":"#F5EFE3","surface":"#F5EFE3","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.7)"}
    ]'::jsonb,
    'cultural-red', '', '', '[]'::jsonb,
    true, 12
  ),
  (
    'p13', 'modern-block-wedding-programme', 'Modern Block Wedding Programme',
    'Bagamoyo Press', 'Wedding Programmes', null, 78000, 7000, true,
    '["#1A1A1A","#FBF7F2","#E8D9A7"]'::jsonb,
    '[
      {"name":"Onyx","background":"#FFFFFF","surface":"#1A1A1A","accent":"#1A1A1A","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.6)","muted":"rgba(255,255,255,0.6)"},
      {"name":"Ivory","background":"#FBF7F2","surface":"#F0EDE5","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Warm Gold","background":"#FBF5E8","surface":"#E8D9A7","accent":"#C8A35C","textPrimary":"#1A1A1A","textSecondary":"#7A6030","muted":"#A8884C"}
    ]'::jsonb,
    'modern-block', '', '', '[]'::jsonb,
    true, 13
  ),
  (
    'p14', 'arch-script-reception-menu-cards', 'Arch Script Reception Menu Cards',
    'House of Mwakali', 'Menu Cards', 89000, 53000, 7000, true,
    '["#7A1F2B","#F5EFE3","#A6B89A","#C8A35C"]'::jsonb,
    '[
      {"name":"Deep Red","background":"#F5EFE3","surface":"#F5EFE3","accent":"#7A1F2B","textPrimary":"#7A1F2B","textSecondary":"rgba(122,31,43,0.8)","muted":"rgba(122,31,43,0.6)"},
      {"name":"Cream","background":"#F5EFE3","surface":"#F5EFE3","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Sage Green","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"},
      {"name":"Warm Gold","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#2B1F0A","textSecondary":"#7A6030","muted":"#A8884C"}
    ]'::jsonb,
    'arch-script', '', '', '[]'::jsonb,
    true, 14
  ),
  (
    'p15', 'sage-panel-thank-you-cards', 'Sage Panel Thank You Cards',
    'Pwani Paper Co.', 'Thank You Cards', null, 56000, 7000, false,
    '["#A6B89A","#FBF7F2","#5C6B4D"]'::jsonb,
    '[
      {"name":"Sage Panel","background":"#A6B89A","surface":"#FBF7F2","accent":"#5C6B4D","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"rgba(92,107,77,0.7)"},
      {"name":"Ivory","background":"#FBF7F2","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"#7A8A6E"},
      {"name":"Forest","background":"#5C6B4D","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#F5F2EC","textSecondary":"rgba(245,242,236,0.8)","muted":"rgba(245,242,236,0.6)"}
    ]'::jsonb,
    'sage-panel', '', '', '[]'::jsonb,
    true, 15
  ),
  (
    'p16', 'navy-and-gold-all-in-one-invitations', 'Navy & Gold All-in-one Invitations',
    'Studio Saba', 'All-in-One Wedding Invitations', null, 215000, 13000, true,
    '["#1E2D54","#E8D9A7","#F5EFE3"]'::jsonb,
    '[
      {"name":"Navy & Gold","background":"#1E2D54","surface":"#1E2D54","accent":"#E8D9A7","textPrimary":"#F5EFE3","textSecondary":"#E8D9A7","muted":"rgba(232,217,167,0.7)"},
      {"name":"Champagne","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#1E2D54","textSecondary":"#2E4080","muted":"rgba(30,45,84,0.6)"},
      {"name":"Ivory & Navy","background":"#F5EFE3","surface":"#F5EFE3","accent":"#1E2D54","textPrimary":"#1E2D54","textSecondary":"#2E4080","muted":"rgba(30,45,84,0.55)"}
    ]'::jsonb,
    'navy-gold', '', '', '[]'::jsonb,
    true, 16
  ),
  (
    'p17', 'minimal-line-save-the-date-cards', 'Minimal Line Save the Date Cards',
    'Lake Manyara Press', 'Save the Dates', 88000, 53000, 7000, true,
    '["#FFFFFF","#1A1A1A","#A6B89A"]'::jsonb,
    '[
      {"name":"White","background":"#FFFFFF","surface":"#FFFFFF","accent":"#1A1A1A","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Onyx","background":"#1A1A1A","surface":"#1A1A1A","accent":"#FFFFFF","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.7)","muted":"rgba(255,255,255,0.5)"},
      {"name":"Sage","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"}
    ]'::jsonb,
    'minimal-line', '', '', '[]'::jsonb,
    true, 17
  ),
  (
    'p18', 'blush-frame-sweet-sixteen-invitations', 'Blush Frame Sweet Sixteen Invitations',
    'Mzimbazi Studio', 'Birthday Invitations', null, 119000, 10000, false,
    '["#F5DCE2","#A84F66","#7A1F2B"]'::jsonb,
    '[
      {"name":"Blush","background":"#F5DCE2","surface":"#FFFFFF","accent":"#A84F66","textPrimary":"#7A1F2B","textSecondary":"#A84F66","muted":"#A84F66"},
      {"name":"Rose","background":"#FDF0F3","surface":"#FFFFFF","accent":"#A84F66","textPrimary":"#A84F66","textSecondary":"#C07080","muted":"rgba(168,79,102,0.6)"},
      {"name":"Deep Red","background":"#7A1F2B","surface":"#FFFFFF","accent":"#F5DCE2","textPrimary":"#7A1F2B","textSecondary":"#A84F66","muted":"#C07080"}
    ]'::jsonb,
    'blush-frame', '', '', '[]'::jsonb,
    true, 18
  ),
  (
    'p19', 'two-of-us-photo-wedding-invitations', 'Two of Us Photo Wedding Invitations',
    'Bagamoyo Press', 'Wedding Invitations', null, 198000, 15000, true,
    '["#1A1A1A","#F5EFE3","#7A1F2B"]'::jsonb,
    '[
      {"name":"Dark Overlay","background":"transparent","surface":"rgba(0,0,0,0.35)","accent":"rgba(255,255,255,0.6)","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.8)","muted":"rgba(255,255,255,0.7)"},
      {"name":"Soft Cream","background":"transparent","surface":"rgba(245,239,227,0.55)","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Crimson Veil","background":"transparent","surface":"rgba(122,31,43,0.45)","accent":"#F5EFE3","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.85)","muted":"rgba(255,255,255,0.65)"}
    ]'::jsonb,
    'photo-overlay', '', '', '[]'::jsonb,
    true, 19
  ),
  (
    'p20', 'classic-serif-welcome-sign-cards', 'Classic Serif Welcome Sign Cards',
    'House of Mwakali', 'Welcome Signs', 124000, 74000, 8000, true,
    '["#F5EFE3","#1A1A1A","#C8A35C"]'::jsonb,
    '[
      {"name":"Classic Cream","background":"#F5EFE3","surface":"#F5EFE3","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},
      {"name":"Onyx","background":"#1A1A1A","surface":"#2A2A2A","accent":"#6B6B6B","textPrimary":"#F5EFE3","textSecondary":"#C4B9A8","muted":"#8D8D8D"},
      {"name":"Warm Gold","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#2B1F0A","textSecondary":"#7A6030","muted":"#A8884C"}
    ]'::jsonb,
    'classic-serif', '', '', '[]'::jsonb,
    true, 20
  ),
  (
    'p21', 'teal-fiesta-save-the-date-cards', 'Teal Fiesta Save the Date Cards',
    'Mzimbazi Studio', 'Save the Dates', null, 95000, 8000, true,
    '["#00a79d","#0F2535","#7A3B2E"]'::jsonb,
    '[
      {"name":"Teal & Gold","background":"#00a79d","surface":"#00a79d","accent":"#6fc7b0","textPrimary":"#ffffff","textSecondary":"#ffffff","muted":"rgba(255,255,255,0.65)"},
      {"name":"Ocean Night","background":"#0F2535","surface":"#0F2535","accent":"#7EBFB5","textPrimary":"#EDF5F4","textSecondary":"#7EBFB5","muted":"rgba(126,191,181,0.55)"},
      {"name":"Coral Terracotta","background":"#7A3B2E","surface":"#7A3B2E","accent":"#E8A87C","textPrimary":"#FDF0E8","textSecondary":"#E8A87C","muted":"rgba(232,168,124,0.65)"}
    ]'::jsonb,
    'save-the-date', '', '', '[]'::jsonb,
    true, 21
  ),
  (
    'p22', 'teal-fiesta-photo-save-the-date-cards', 'Teal Fiesta Photo Save the Date Cards',
    'Mzimbazi Studio', 'Save the Dates', null, 110000, 10000, true,
    '["#00a79d","#0F2535","#7A3B2E"]'::jsonb,
    '[
      {"name":"Teal & Gold","background":"#00a79d","surface":"#00a79d","accent":"#6fc7b0","textPrimary":"#ffffff","textSecondary":"#ffffff","muted":"rgba(255,255,255,0.65)"},
      {"name":"Ocean Night","background":"#0F2535","surface":"#0F2535","accent":"#7EBFB5","textPrimary":"#EDF5F4","textSecondary":"#7EBFB5","muted":"rgba(126,191,181,0.55)"},
      {"name":"Coral Terracotta","background":"#7A3B2E","surface":"#7A3B2E","accent":"#E8A87C","textPrimary":"#FDF0E8","textSecondary":"#E8A87C","muted":"rgba(232,168,124,0.65)"}
    ]'::jsonb,
    'save-the-date-photo',
    '/assets/invitation-svgs/model-wedding-package/save-the-date-front.svg', '',
    '["/assets/invitation-svgs/model-wedding-package/save-the-date-back.svg","/assets/invitation-svgs/model-wedding-package/ticket-front.svg"]'::jsonb,
    true, 22
  ),
  (
    'p23', 'heritage-script-wedding-event-ticket', 'Heritage Script Wedding Event Ticket',
    'Mzimbazi Studio', 'Event Tickets', null, 85000, 7000, true,
    '["#f5f0ea","#1A1208","#F5EFE3","#1A1A1A"]'::jsonb,
    '[
      {"name":"Parchment & Gold","background":"#f5f0ea","surface":"#ffffff","accent":"#ab8d53","textPrimary":"#3a2d1f","textSecondary":"#ab8d53","muted":"rgba(106,86,64,0.8)"},
      {"name":"Midnight Gold","background":"#1A1208","surface":"#ffffff","accent":"#C8A35C","textPrimary":"#FBF5E8","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.75)"},
      {"name":"Ivory & Crimson","background":"#F5EFE3","surface":"#ffffff","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.7)"},
      {"name":"Onyx & Gold","background":"#1A1A1A","surface":"#ffffff","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.7)"}
    ]'::jsonb,
    'ticket', '/assets/invitation-svgs/model-wedding-package/ticket-front.svg', '',
    '[]'::jsonb,
    true, 23
  ),
  (
    'p24', 'heritage-script-wedding-event-ticket-with-barcode', 'Heritage Script Wedding Event Ticket with Barcode',
    'Mzimbazi Studio', 'Event Tickets', null, 90000, 7000, true,
    '["#f5f0ea","#1A1208","#F5EFE3","#1A1A1A"]'::jsonb,
    '[
      {"name":"Parchment & Gold","background":"#f5f0ea","surface":"#ffffff","accent":"#ab8d53","textPrimary":"#3a2d1f","textSecondary":"#ab8d53","muted":"rgba(106,86,64,0.8)"},
      {"name":"Midnight Gold","background":"#1A1208","surface":"#ffffff","accent":"#C8A35C","textPrimary":"#FBF5E8","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.75)"},
      {"name":"Ivory & Crimson","background":"#F5EFE3","surface":"#ffffff","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.7)"},
      {"name":"Onyx & Gold","background":"#1A1A1A","surface":"#ffffff","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.7)"}
    ]'::jsonb,
    'ticket-barcode', '/assets/invitation-svgs/model-wedding-package/ticket-barcode-front.svg', '',
    '[]'::jsonb,
    true, 24
  )
ON CONFLICT (id) DO UPDATE SET
  slug             = EXCLUDED.slug,
  name             = EXCLUDED.name,
  designer         = EXCLUDED.designer,
  category         = EXCLUDED.category,
  price_was        = EXCLUDED.price_was,
  price_now        = EXCLUDED.price_now,
  digital_unit_price = EXCLUDED.digital_unit_price,
  free_sample      = EXCLUDED.free_sample,
  swatches         = EXCLUDED.swatches,
  palettes         = EXCLUDED.palettes,
  treatment        = EXCLUDED.treatment,
  image_url        = CASE WHEN website_invitations_products.image_url = '' THEN EXCLUDED.image_url ELSE website_invitations_products.image_url END,
  gallery          = CASE WHEN website_invitations_products.gallery = '[]'::jsonb THEN EXCLUDED.gallery ELSE website_invitations_products.gallery END,
  published        = EXCLUDED.published,
  sort_order       = EXCLUDED.sort_order;
