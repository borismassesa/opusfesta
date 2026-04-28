-- Website Page Sections — CMS-editable content blocks for opus_website pages
-- Mirrors studio_page_sections pattern for the public marketplace site.

create table if not exists website_page_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  content jsonb not null default '{}',
  draft_content jsonb default null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_key, section_key)
);

comment on column website_page_sections.draft_content is
  'Staged content not yet published. NULL = no pending changes.';

create or replace function update_website_page_sections_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_website_page_sections_updated_at
  before update on website_page_sections
  for each row execute function update_website_page_sections_updated_at();

alter table website_page_sections enable row level security;

create policy "Service role full access on website_page_sections"
  on website_page_sections for all
  using (true)
  with check (true);

-- Seed Hero with current hardcoded values from apps/opus_website/src/components/hero.tsx
insert into website_page_sections (page_key, section_key, content, sort_order) values
(
  'home', 'hero',
  '{
    "headline_line_1": "Everything You Need",
    "headline_line_2": "To Plan Your Wedding",
    "headline_line_3": "All In One Place.",
    "subheadline": "Make your wedding planning effortless. Discover venues, connect with vendors, and manage your registry. All from one easy-to-use platform.",
    "primary_cta_label": "Start planning",
    "primary_cta_href": "#",
    "secondary_cta_label": "Find vendors",
    "secondary_cta_href": "/vendors",
    "media_type": "video",
    "media_url": "/assets/videos/couple_.mp4"
  }'::jsonb,
  1
)
on conflict (page_key, section_key) do nothing;
