-- Mockup carousel CMS — stores one hero photo per scene.
-- Designers upload images via the admin; the product detail page reads them at
-- request time and displays them in the MockupCarousel in place of CSS scenes.

create table if not exists website_cms_mockup_carousel (
  scene text primary key,
  url   text not null default '',
  updated_at timestamptz not null default now()
);

create or replace function update_website_cms_mockup_carousel_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_website_cms_mockup_carousel_updated_at on website_cms_mockup_carousel;
create trigger trg_website_cms_mockup_carousel_updated_at
  before update on website_cms_mockup_carousel
  for each row execute function update_website_cms_mockup_carousel_updated_at();

alter table website_cms_mockup_carousel enable row level security;

create policy "Service role full access on website_cms_mockup_carousel"
  on website_cms_mockup_carousel for all using (true) with check (true);

-- Seed the five scene slots (empty URLs — admin fills them in).
insert into website_cms_mockup_carousel (scene) values
  ('flat-lay'),
  ('dark-studio'),
  ('paper-stack'),
  ('envelope'),
  ('phone')
on conflict (scene) do nothing;
