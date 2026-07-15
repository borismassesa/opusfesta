-- OpusPass invitation products CMS — schema for the public /invitations catalog
-- and product detail pages on opus_pass. Prefixed with `website_` to match the
-- other curated marketing tables (website_vendors, website_page_sections).
--
-- These rows drive /invitations, /invitations/catalog and /invitations/p/[id].
-- The opus_pass app reads them with the service role at request time and falls
-- back to its bundled static catalog if the table is empty/unreachable.

create table if not exists website_invitations_products (
  id text primary key,
  slug text unique not null,
  name text not null,
  designer text not null default '',
  category text not null default '',

  -- Pricing (TZS). price_was is the optional struck-through "before" total.
  price_was int,
  price_now int not null default 0,
  digital_unit_price int not null default 0,
  free_sample boolean not null default false,

  -- Design colour swatches (array of hex strings) shown on the detail page.
  swatches jsonb not null default '[]'::jsonb,
  -- Built-in CSS card design used when no artwork is attached.
  treatment text not null default 'classic-serif',
  -- Attached card artwork. image_url is the hero; gallery is extra views.
  image_url text not null default '',
  gallery jsonb not null default '[]'::jsonb,

  published boolean not null default true,
  sort_order int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_invitations_products_category_idx on website_invitations_products(category);
create index if not exists website_invitations_products_published_idx on website_invitations_products(published) where published = true;
create index if not exists website_invitations_products_sort_idx on website_invitations_products(sort_order);

create or replace function update_website_invitations_products_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_website_invitations_products_updated_at on website_invitations_products;
create trigger trg_website_invitations_products_updated_at
  before update on website_invitations_products
  for each row execute function update_website_invitations_products_updated_at();

alter table website_invitations_products enable row level security;

create policy "Service role full access on website_invitations_products"
  on website_invitations_products for all using (true) with check (true);

-- Seed the existing bundled catalog. ON CONFLICT DO NOTHING keeps later admin
-- edits intact if the migration is ever re-run.
insert into website_invitations_products
  (id, slug, name, designer, category, price_was, price_now, digital_unit_price, free_sample, swatches, treatment, sort_order)
values
  ('p1','p1','Botanical Frame Wedding Invitations','Bagamoyo Press','Wedding Invitations',199000,119000,10000,true,'["#A6B89A","#F5DCE2","#FBF7F2","#1A1A1A","#7A1F2B"]','floral-border',10),
  ('p2','p2','Heritage Crown Karibu Invitations','House of Mwakali','Wedding Invitations',215000,129000,12000,true,'["#7A1F2B","#C8A35C","#F5EFE3","#1A1A1A"]','cultural-red',20),
  ('p3','p3','Modern Block All-in-one Invitations','Studio Saba','All-in-One Wedding Invitations',null,132000,11000,false,'["#1A1A1A","#FBF7F2","#E8D9A7"]','modern-block',30),
  ('p4','p4','Arch Script Save the Date Cards','Mzimbazi Studio','Save the Dates',null,98000,8000,true,'["#7A1F2B","#F5EFE3","#A6B89A"]','arch-script',40),
  ('p5','p5','Sage Panel Engagement Invitations','Pwani Paper Co.','Engagement Invitations',165000,99000,10000,true,'["#A6B89A","#FBF7F2","#5C6B4D"]','sage-panel',50),
  ('p6','p6','Navy & Gold Classic Invitations','Studio Saba','Wedding Invitations',null,189000,12000,false,'["#1E2D54","#E8D9A7","#F5EFE3","#C8A35C"]','navy-gold',60),
  ('p7','p7','Minimal Line Modern Invitations','Bagamoyo Press','Wedding Invitations',null,112000,9000,true,'["#FFFFFF","#1A1A1A","#A6B89A"]','minimal-line',70),
  ('p8','p8','Blush Frame Bridal Shower Invitations','House of Mwakali','Bridal Shower Invitations',145000,87000,9000,true,'["#F5DCE2","#A84F66","#7A1F2B","#FBF7F2"]','blush-frame',80),
  ('p9','p9','Two of Us Photo Save the Date Cards','Lake Manyara Press','Save the Dates',null,167000,12000,false,'["#1A1A1A","#F5EFE3","#A6B89A"]','photo-overlay',90),
  ('p10','p10','Classic Serif Cream Invitations','Pwani Paper Co.','Wedding Invitations',139000,83000,10000,true,'["#F5EFE3","#1A1A1A","#A6B89A","#C8A35C"]','classic-serif',100),
  ('p11','p11','Botanical Frame Save the Date Cards','Mzimbazi Studio','Save the Dates',null,92000,8000,true,'["#A6B89A","#F5DCE2","#FBF7F2"]','floral-border',110),
  ('p12','p12','Heritage Karibu Reception Cards','Studio Saba','Reception Cards',null,156000,11000,false,'["#7A1F2B","#C8A35C","#F5EFE3"]','cultural-red',120),
  ('p13','p13','Modern Block Wedding Programme','Bagamoyo Press','Wedding Programmes',null,78000,7000,true,'["#1A1A1A","#FBF7F2","#E8D9A7"]','modern-block',130),
  ('p14','p14','Arch Script Reception Menu Cards','House of Mwakali','Menu Cards',89000,53000,7000,true,'["#7A1F2B","#F5EFE3","#A6B89A","#C8A35C"]','arch-script',140),
  ('p15','p15','Sage Panel Thank You Cards','Pwani Paper Co.','Thank You Cards',null,56000,7000,false,'["#A6B89A","#FBF7F2","#5C6B4D"]','sage-panel',150),
  ('p16','p16','Navy & Gold All-in-one Invitations','Studio Saba','All-in-One Wedding Invitations',null,215000,13000,true,'["#1E2D54","#E8D9A7","#F5EFE3"]','navy-gold',160),
  ('p17','p17','Minimal Line Save the Date Cards','Lake Manyara Press','Save the Dates',88000,53000,7000,true,'["#FFFFFF","#1A1A1A","#A6B89A"]','minimal-line',170),
  ('p18','p18','Blush Frame Sweet Sixteen Invitations','Mzimbazi Studio','Birthday Invitations',null,119000,10000,false,'["#F5DCE2","#A84F66","#7A1F2B"]','blush-frame',180),
  ('p19','p19','Two of Us Photo Wedding Invitations','Bagamoyo Press','Wedding Invitations',null,198000,15000,true,'["#1A1A1A","#F5EFE3","#7A1F2B"]','photo-overlay',190),
  ('p20','p20','Classic Serif Welcome Sign Cards','House of Mwakali','Welcome Signs',124000,74000,8000,true,'["#F5EFE3","#1A1A1A","#C8A35C"]','classic-serif',200)
on conflict (id) do nothing;
