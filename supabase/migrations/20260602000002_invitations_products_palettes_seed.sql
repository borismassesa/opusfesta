-- Add palettes column and seed all 24 products with complete data.
-- After this migration the opus_pass app no longer needs the bundled static
-- PRODUCTS array. designImage is derived from image_url at runtime — no separate column.

alter table website_invitations_products
  add column if not exists palettes  jsonb not null default '[]'::jsonb;

-- Upsert all 24 products with full data (palettes + gallery).
-- ON CONFLICT UPDATE only backfills palettes; image_url and gallery are only
-- updated when the existing value is empty so admin uploads are preserved.
insert into website_invitations_products
  (id, slug, name, designer, category, price_was, price_now, digital_unit_price,
   free_sample, swatches, treatment, image_url, gallery, palettes, sort_order, published)
values
-- p1
('p1','p1','Botanical Frame Wedding Invitations','Bagamoyo Press','Wedding Invitations',199000,119000,10000,true,
 '["#A6B89A","#F5DCE2","#FBF7F2","#1A1A1A","#7A1F2B"]','floral-border',
 '','[]',
 '[{"name":"Sage Green","background":"#FBF7F2","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"#7A8A6E"},{"name":"Blush Pink","background":"#FDF5F7","surface":"#FDF5F7","accent":"#F5DCE2","textPrimary":"#1A1A1A","textSecondary":"#A84F66","muted":"#C07080"},{"name":"Ivory","background":"#FBF7F2","surface":"#FBF7F2","accent":"#D8CFC4","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Onyx","background":"#F0EEE9","surface":"#F0EEE9","accent":"#1A1A1A","textPrimary":"#1A1A1A","textSecondary":"#3A3A3A","muted":"#6B6B6B"},{"name":"Deep Red","background":"#FBF2F0","surface":"#FBF2F0","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.65)"}]',
 10,true),
-- p2
('p2','p2','Heritage Crown Karibu Invitations','House of Mwakali','Wedding Invitations',215000,129000,12000,true,
 '["#7A1F2B","#C8A35C","#F5EFE3","#1A1A1A"]','cultural-red',
 '',
 '["/assets/invitation-svgs/model-wedding-package/ticket-front.svg"]',
 '[{"name":"Heritage Red","background":"#7A1F2B","surface":"#7A1F2B","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.8)"},{"name":"Midnight Gold","background":"#1A1208","surface":"#1A1208","accent":"#C8A35C","textPrimary":"#FBF5E8","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.75)"},{"name":"Cream & Crimson","background":"#F5EFE3","surface":"#F5EFE3","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.7)"},{"name":"Onyx Gold","background":"#1A1A1A","surface":"#1A1A1A","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.7)"}]',
 20,true),
-- p3
('p3','p3','Modern Block All-in-one Invitations','Studio Saba','All-in-One Wedding Invitations',null,132000,11000,false,
 '["#1A1A1A","#FBF7F2","#E8D9A7"]','modern-block',
 '','[]',
 '[{"name":"Onyx","background":"#FFFFFF","surface":"#1A1A1A","accent":"#1A1A1A","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.6)","muted":"rgba(255,255,255,0.6)"},{"name":"Ivory","background":"#FBF7F2","surface":"#F0EDE5","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Warm Gold","background":"#FBF5E8","surface":"#E8D9A7","accent":"#C8A35C","textPrimary":"#1A1A1A","textSecondary":"#7A6030","muted":"#A8884C"}]',
 30,true),
-- p4
('p4','p4','Arch Script Save the Date Cards','Mzimbazi Studio','Save the Dates',null,98000,8000,true,
 '["#7A1F2B","#F5EFE3","#A6B89A"]','arch-script',
 '','[]',
 '[{"name":"Deep Red","background":"#F5EFE3","surface":"#F5EFE3","accent":"#7A1F2B","textPrimary":"#7A1F2B","textSecondary":"rgba(122,31,43,0.8)","muted":"rgba(122,31,43,0.6)"},{"name":"Cream","background":"#F5EFE3","surface":"#F5EFE3","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Sage Green","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"}]',
 40,true),
-- p5
('p5','p5','Sage Panel Engagement Invitations','Pwani Paper Co.','Engagement Invitations',165000,99000,10000,true,
 '["#A6B89A","#FBF7F2","#5C6B4D"]','sage-panel',
 '','[]',
 '[{"name":"Sage Panel","background":"#A6B89A","surface":"#FBF7F2","accent":"#5C6B4D","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"rgba(92,107,77,0.7)"},{"name":"Ivory","background":"#FBF7F2","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"#7A8A6E"},{"name":"Forest","background":"#5C6B4D","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#F5F2EC","textSecondary":"rgba(245,242,236,0.8)","muted":"rgba(245,242,236,0.6)"}]',
 50,true),
-- p6
('p6','p6','Navy & Gold Classic Invitations','Studio Saba','Wedding Invitations',null,189000,12000,false,
 '["#1E2D54","#E8D9A7","#F5EFE3","#C8A35C"]','navy-gold',
 '','[]',
 '[{"name":"Navy & Gold","background":"#1E2D54","surface":"#1E2D54","accent":"#E8D9A7","textPrimary":"#F5EFE3","textSecondary":"#E8D9A7","muted":"rgba(232,217,167,0.7)"},{"name":"Champagne","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#1E2D54","textSecondary":"#2E4080","muted":"rgba(30,45,84,0.6)"},{"name":"Ivory & Navy","background":"#F5EFE3","surface":"#F5EFE3","accent":"#1E2D54","textPrimary":"#1E2D54","textSecondary":"#2E4080","muted":"rgba(30,45,84,0.55)"},{"name":"Midnight Gold","background":"#1A1208","surface":"#1A1208","accent":"#C8A35C","textPrimary":"#FBF5E8","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.7)"}]',
 60,true),
-- p7
('p7','p7','Minimal Line Modern Invitations','Bagamoyo Press','Wedding Invitations',null,112000,9000,true,
 '["#FFFFFF","#1A1A1A","#A6B89A"]','minimal-line',
 '','[]',
 '[{"name":"White","background":"#FFFFFF","surface":"#FFFFFF","accent":"#1A1A1A","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Onyx","background":"#1A1A1A","surface":"#1A1A1A","accent":"#FFFFFF","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.7)","muted":"rgba(255,255,255,0.5)"},{"name":"Sage","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"}]',
 70,true),
-- p8
('p8','p8','Blush Frame Bridal Shower Invitations','House of Mwakali','Bridal Shower Invitations',145000,87000,9000,true,
 '["#F5DCE2","#A84F66","#7A1F2B","#FBF7F2"]','blush-frame',
 '','[]',
 '[{"name":"Blush","background":"#F5DCE2","surface":"#FFFFFF","accent":"#A84F66","textPrimary":"#7A1F2B","textSecondary":"#A84F66","muted":"#A84F66"},{"name":"Rose","background":"#FDF0F3","surface":"#FFFFFF","accent":"#A84F66","textPrimary":"#A84F66","textSecondary":"#C07080","muted":"rgba(168,79,102,0.6)"},{"name":"Deep Red","background":"#7A1F2B","surface":"#FFFFFF","accent":"#F5DCE2","textPrimary":"#7A1F2B","textSecondary":"#A84F66","muted":"#C07080"},{"name":"Ivory","background":"#FBF7F2","surface":"#FFFFFF","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"}]',
 80,true),
-- p9
('p9','p9','Two of Us Photo Save the Date Cards','Lake Manyara Press','Save the Dates',null,167000,12000,false,
 '["#1A1A1A","#F5EFE3","#A6B89A"]','photo-overlay',
 '','[]',
 '[{"name":"Dark Overlay","background":"transparent","surface":"rgba(0,0,0,0.35)","accent":"rgba(255,255,255,0.6)","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.8)","muted":"rgba(255,255,255,0.7)"},{"name":"Soft Cream","background":"transparent","surface":"rgba(245,239,227,0.55)","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Sage Wash","background":"transparent","surface":"rgba(166,184,154,0.45)","accent":"#5C6B4D","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.85)","muted":"rgba(255,255,255,0.65)"}]',
 90,true),
-- p10
('p10','p10','Classic Serif Cream Invitations','Pwani Paper Co.','Wedding Invitations',139000,83000,10000,true,
 '["#F5EFE3","#1A1A1A","#A6B89A","#C8A35C"]','classic-serif',
 '','[]',
 '[{"name":"Classic Cream","background":"#F5EFE3","surface":"#F5EFE3","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Onyx","background":"#1A1A1A","surface":"#2A2A2A","accent":"#6B6B6B","textPrimary":"#F5EFE3","textSecondary":"#C4B9A8","muted":"#8D8D8D"},{"name":"Sage","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"},{"name":"Warm Gold","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#2B1F0A","textSecondary":"#7A6030","muted":"#A8884C"}]',
 100,true),
-- p11
('p11','p11','Botanical Frame Save the Date Cards','Mzimbazi Studio','Save the Dates',null,92000,8000,true,
 '["#A6B89A","#F5DCE2","#FBF7F2"]','floral-border',
 '','[]',
 '[{"name":"Sage Green","background":"#FBF7F2","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"#7A8A6E"},{"name":"Blush Pink","background":"#FDF5F7","surface":"#FDF5F7","accent":"#F5DCE2","textPrimary":"#1A1A1A","textSecondary":"#A84F66","muted":"#C07080"},{"name":"Ivory","background":"#FBF7F2","surface":"#FBF7F2","accent":"#D8CFC4","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"}]',
 110,true),
-- p12
('p12','p12','Heritage Karibu Reception Cards','Studio Saba','Reception Cards',null,156000,11000,false,
 '["#7A1F2B","#C8A35C","#F5EFE3"]','cultural-red',
 '','[]',
 '[{"name":"Heritage Red","background":"#7A1F2B","surface":"#7A1F2B","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.8)"},{"name":"Warm Gold","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#2B1F0A","textSecondary":"#7A6030","muted":"#A8884C"},{"name":"Cream & Crimson","background":"#F5EFE3","surface":"#F5EFE3","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.7)"}]',
 120,true),
-- p13
('p13','p13','Modern Block Wedding Programme','Bagamoyo Press','Wedding Programmes',null,78000,7000,true,
 '["#1A1A1A","#FBF7F2","#E8D9A7"]','modern-block',
 '','[]',
 '[{"name":"Onyx","background":"#FFFFFF","surface":"#1A1A1A","accent":"#1A1A1A","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.6)","muted":"rgba(255,255,255,0.6)"},{"name":"Ivory","background":"#FBF7F2","surface":"#F0EDE5","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Warm Gold","background":"#FBF5E8","surface":"#E8D9A7","accent":"#C8A35C","textPrimary":"#1A1A1A","textSecondary":"#7A6030","muted":"#A8884C"}]',
 130,true),
-- p14
('p14','p14','Arch Script Reception Menu Cards','House of Mwakali','Menu Cards',89000,53000,7000,true,
 '["#7A1F2B","#F5EFE3","#A6B89A","#C8A35C"]','arch-script',
 '','[]',
 '[{"name":"Deep Red","background":"#F5EFE3","surface":"#F5EFE3","accent":"#7A1F2B","textPrimary":"#7A1F2B","textSecondary":"rgba(122,31,43,0.8)","muted":"rgba(122,31,43,0.6)"},{"name":"Cream","background":"#F5EFE3","surface":"#F5EFE3","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Sage Green","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"},{"name":"Warm Gold","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#2B1F0A","textSecondary":"#7A6030","muted":"#A8884C"}]',
 140,true),
-- p15
('p15','p15','Sage Panel Thank You Cards','Pwani Paper Co.','Thank You Cards',null,56000,7000,false,
 '["#A6B89A","#FBF7F2","#5C6B4D"]','sage-panel',
 '','[]',
 '[{"name":"Sage Panel","background":"#A6B89A","surface":"#FBF7F2","accent":"#5C6B4D","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"rgba(92,107,77,0.7)"},{"name":"Ivory","background":"#FBF7F2","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#1A1A1A","textSecondary":"#5C6B4D","muted":"#7A8A6E"},{"name":"Forest","background":"#5C6B4D","surface":"#FBF7F2","accent":"#A6B89A","textPrimary":"#F5F2EC","textSecondary":"rgba(245,242,236,0.8)","muted":"rgba(245,242,236,0.6)"}]',
 150,true),
-- p16
('p16','p16','Navy & Gold All-in-one Invitations','Studio Saba','All-in-One Wedding Invitations',null,215000,13000,true,
 '["#1E2D54","#E8D9A7","#F5EFE3"]','navy-gold',
 '','[]',
 '[{"name":"Navy & Gold","background":"#1E2D54","surface":"#1E2D54","accent":"#E8D9A7","textPrimary":"#F5EFE3","textSecondary":"#E8D9A7","muted":"rgba(232,217,167,0.7)"},{"name":"Champagne","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#1E2D54","textSecondary":"#2E4080","muted":"rgba(30,45,84,0.6)"},{"name":"Ivory & Navy","background":"#F5EFE3","surface":"#F5EFE3","accent":"#1E2D54","textPrimary":"#1E2D54","textSecondary":"#2E4080","muted":"rgba(30,45,84,0.55)"}]',
 160,true),
-- p17
('p17','p17','Minimal Line Save the Date Cards','Lake Manyara Press','Save the Dates',88000,53000,7000,true,
 '["#FFFFFF","#1A1A1A","#A6B89A"]','minimal-line',
 '','[]',
 '[{"name":"White","background":"#FFFFFF","surface":"#FFFFFF","accent":"#1A1A1A","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Onyx","background":"#1A1A1A","surface":"#1A1A1A","accent":"#FFFFFF","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.7)","muted":"rgba(255,255,255,0.5)"},{"name":"Sage","background":"#EEF2EB","surface":"#EEF2EB","accent":"#A6B89A","textPrimary":"#2E3D28","textSecondary":"#5C6B4D","muted":"#7A8A6E"}]',
 170,true),
-- p18
('p18','p18','Blush Frame Sweet Sixteen Invitations','Mzimbazi Studio','Birthday Invitations',null,119000,10000,false,
 '["#F5DCE2","#A84F66","#7A1F2B"]','blush-frame',
 '','[]',
 '[{"name":"Blush","background":"#F5DCE2","surface":"#FFFFFF","accent":"#A84F66","textPrimary":"#7A1F2B","textSecondary":"#A84F66","muted":"#A84F66"},{"name":"Rose","background":"#FDF0F3","surface":"#FFFFFF","accent":"#A84F66","textPrimary":"#A84F66","textSecondary":"#C07080","muted":"rgba(168,79,102,0.6)"},{"name":"Deep Red","background":"#7A1F2B","surface":"#FFFFFF","accent":"#F5DCE2","textPrimary":"#7A1F2B","textSecondary":"#A84F66","muted":"#C07080"}]',
 180,true),
-- p19
('p19','p19','Two of Us Photo Wedding Invitations','Bagamoyo Press','Wedding Invitations',null,198000,15000,true,
 '["#1A1A1A","#F5EFE3","#7A1F2B"]','photo-overlay',
 '','[]',
 '[{"name":"Dark Overlay","background":"transparent","surface":"rgba(0,0,0,0.35)","accent":"rgba(255,255,255,0.6)","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.8)","muted":"rgba(255,255,255,0.7)"},{"name":"Soft Cream","background":"transparent","surface":"rgba(245,239,227,0.55)","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Crimson Veil","background":"transparent","surface":"rgba(122,31,43,0.45)","accent":"#F5EFE3","textPrimary":"#FFFFFF","textSecondary":"rgba(255,255,255,0.85)","muted":"rgba(255,255,255,0.65)"}]',
 190,true),
-- p20
('p20','p20','Classic Serif Welcome Sign Cards','House of Mwakali','Welcome Signs',124000,74000,8000,true,
 '["#F5EFE3","#1A1A1A","#C8A35C"]','classic-serif',
 '','[]',
 '[{"name":"Classic Cream","background":"#F5EFE3","surface":"#F5EFE3","accent":"#C4B9A8","textPrimary":"#1A1A1A","textSecondary":"#6B6B6B","muted":"#8D8D8D"},{"name":"Onyx","background":"#1A1A1A","surface":"#2A2A2A","accent":"#6B6B6B","textPrimary":"#F5EFE3","textSecondary":"#C4B9A8","muted":"#8D8D8D"},{"name":"Warm Gold","background":"#FBF5E8","surface":"#FBF5E8","accent":"#C8A35C","textPrimary":"#2B1F0A","textSecondary":"#7A6030","muted":"#A8884C"}]',
 200,true),
-- p21
('p21','p21','Teal Fiesta Save the Date Cards','Mzimbazi Studio','Save the Dates',null,95000,8000,true,
 '["#00a79d","#0F2535","#7A3B2E"]','save-the-date',
 '','[]',
 '[{"name":"Teal & Gold","background":"#00a79d","surface":"#00a79d","accent":"#6fc7b0","textPrimary":"#ffffff","textSecondary":"#ffffff","muted":"rgba(255,255,255,0.65)"},{"name":"Ocean Night","background":"#0F2535","surface":"#0F2535","accent":"#7EBFB5","textPrimary":"#EDF5F4","textSecondary":"#7EBFB5","muted":"rgba(126,191,181,0.55)"},{"name":"Coral Terracotta","background":"#7A3B2E","surface":"#7A3B2E","accent":"#E8A87C","textPrimary":"#FDF0E8","textSecondary":"#E8A87C","muted":"rgba(232,168,124,0.65)"}]',
 210,true),
-- p22
('p22','p22','Teal Fiesta Photo Save the Date Cards','Mzimbazi Studio','Save the Dates',null,110000,10000,true,
 '["#00a79d","#0F2535","#7A3B2E"]','save-the-date-photo',
 '/assets/invitation-svgs/model-wedding-package/save-the-date-front.svg',
 '["/assets/invitation-svgs/model-wedding-package/save-the-date-back.svg","/assets/invitation-svgs/model-wedding-package/ticket-front.svg"]',
 '[{"name":"Teal & Gold","background":"#00a79d","surface":"#00a79d","accent":"#6fc7b0","textPrimary":"#ffffff","textSecondary":"#ffffff","muted":"rgba(255,255,255,0.65)"},{"name":"Ocean Night","background":"#0F2535","surface":"#0F2535","accent":"#7EBFB5","textPrimary":"#EDF5F4","textSecondary":"#7EBFB5","muted":"rgba(126,191,181,0.55)"},{"name":"Coral Terracotta","background":"#7A3B2E","surface":"#7A3B2E","accent":"#E8A87C","textPrimary":"#FDF0E8","textSecondary":"#E8A87C","muted":"rgba(232,168,124,0.65)"}]',
 220,true),
-- p23
('p23','p23','Heritage Script Wedding Event Ticket','Mzimbazi Studio','Event Tickets',null,85000,7000,true,
 '["#f5f0ea","#1A1208","#F5EFE3","#1A1A1A"]','ticket',
 '/assets/invitation-svgs/model-wedding-package/ticket-front.svg','[]',
 '[{"name":"Parchment & Gold","background":"#f5f0ea","surface":"#ffffff","accent":"#ab8d53","textPrimary":"#3a2d1f","textSecondary":"#ab8d53","muted":"rgba(106,86,64,0.8)"},{"name":"Midnight Gold","background":"#1A1208","surface":"#ffffff","accent":"#C8A35C","textPrimary":"#FBF5E8","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.75)"},{"name":"Ivory & Crimson","background":"#F5EFE3","surface":"#ffffff","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.7)"},{"name":"Onyx & Gold","background":"#1A1A1A","surface":"#ffffff","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.7)"}]',
 230,true),
-- p24
('p24','p24','Heritage Script Wedding Event Ticket with Barcode','Mzimbazi Studio','Event Tickets',null,90000,7000,true,
 '["#f5f0ea","#1A1208","#F5EFE3","#1A1A1A"]','ticket-barcode',
 '/assets/invitation-svgs/model-wedding-package/ticket-barcode-front.svg','[]',
 '[{"name":"Parchment & Gold","background":"#f5f0ea","surface":"#ffffff","accent":"#ab8d53","textPrimary":"#3a2d1f","textSecondary":"#ab8d53","muted":"rgba(106,86,64,0.8)"},{"name":"Midnight Gold","background":"#1A1208","surface":"#ffffff","accent":"#C8A35C","textPrimary":"#FBF5E8","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.75)"},{"name":"Ivory & Crimson","background":"#F5EFE3","surface":"#ffffff","accent":"#7A1F2B","textPrimary":"#1A1A1A","textSecondary":"#7A1F2B","muted":"rgba(122,31,43,0.7)"},{"name":"Onyx & Gold","background":"#1A1A1A","surface":"#ffffff","accent":"#C8A35C","textPrimary":"#F5EFE3","textSecondary":"#C8A35C","muted":"rgba(200,163,92,0.7)"}]',
 240,true)
on conflict (id) do update set
  palettes         = excluded.palettes,
  -- image_url is a text column; '' means unset. gallery is a jsonb array; '[]' means empty.
  image_url        = case when website_invitations_products.image_url = '' then excluded.image_url else website_invitations_products.image_url end,
  gallery          = case when website_invitations_products.gallery = '[]'::jsonb then excluded.gallery else website_invitations_products.gallery end;
