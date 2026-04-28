-- Website Vendors CMS — schema for the opus_website /vendors page.
-- NOTE: prefixed with `website_` to avoid collision with the existing
-- marketplace `vendors` table (from 001_initial_schema.sql) which models
-- actual vendor accounts (user_id-linked). These tables hold curated
-- marketing records that drive the public /vendors listing on opus_website.

-- Categories lookup
create table if not exists website_vendor_categories (
  id text primary key,
  label text not null,
  display_order int not null default 0,
  count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Main vendors table
create table if not exists website_vendors (
  id text primary key,
  slug text unique not null,
  name text not null,
  excerpt text not null default '',
  category text not null default '',
  category_id text references website_vendor_categories(id),
  city text not null default '',
  price_range text not null default '',
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  badge text,
  featured boolean not null default false,
  published boolean not null default true,

  hero_media jsonb not null default '{}'::jsonb,
  gallery jsonb not null default '[]'::jsonb,

  about text,
  starting_price text,
  response_time text,
  locally_owned boolean,
  years_in_business int,
  languages jsonb not null default '[]'::jsonb,
  awards jsonb not null default '[]'::jsonb,
  capacity jsonb,
  services jsonb not null default '[]'::jsonb,
  pricing_details jsonb not null default '[]'::jsonb,
  detailed_reviews jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  location jsonb,
  service_area jsonb not null default '[]'::jsonb,
  team jsonb not null default '[]'::jsonb,
  social_links jsonb,
  availability jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_vendors_category_id_idx on website_vendors(category_id);
create index if not exists website_vendors_city_idx on website_vendors(city);
create index if not exists website_vendors_featured_idx on website_vendors(featured) where featured = true;
create index if not exists website_vendors_published_idx on website_vendors(published) where published = true;
create index if not exists website_vendors_slug_idx on website_vendors(slug);

create or replace function update_website_vendors_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_website_vendors_updated_at on website_vendors;
create trigger trg_website_vendors_updated_at
  before update on website_vendors
  for each row execute function update_website_vendors_updated_at();

drop trigger if exists trg_website_vendor_categories_updated_at on website_vendor_categories;
create trigger trg_website_vendor_categories_updated_at
  before update on website_vendor_categories
  for each row execute function update_website_vendors_updated_at();

alter table website_vendors enable row level security;
alter table website_vendor_categories enable row level security;

create policy "Service role full access on website_vendors"
  on website_vendors for all using (true) with check (true);

create policy "Service role full access on website_vendor_categories"
  on website_vendor_categories for all using (true) with check (true);
