-- Studio Admin Portal Migration
-- Creates all tables for the Studio admin CMS

create extension if not exists "pgcrypto";

create table if not exists studio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, number text not null, category text not null,
  title text not null, description text not null, full_description text not null,
  cover_image text not null, stats jsonb not null default '[]', highlights jsonb not null default '[]',
  is_published boolean not null default false, sort_order int not null default 0,
  seo_title text, seo_description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists studio_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null, excerpt text not null, body_html text not null,
  cover_image text not null, author text not null default 'OpusFesta Studio', category text not null,
  published_at timestamptz, is_published boolean not null default false,
  seo_title text, seo_description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists studio_services (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text not null, price text not null, cover_image text not null,
  includes jsonb not null default '[]', is_active boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_type where typname = 'studio_booking_status') then
    create type studio_booking_status as enum ('new','contacted','quoted','confirmed','completed','cancelled');
  end if;
end $$;

create table if not exists studio_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, phone text, event_type text not null,
  preferred_date date, location text, service text, message text,
  status studio_booking_status not null default 'new', admin_notes text, responded_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists studio_testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null, author text not null, role text not null, avatar_url text,
  is_published boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists studio_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null, answer text not null,
  is_published boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists studio_team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null, role text not null, bio text, avatar_url text,
  sort_order int not null default 0, is_published boolean not null default true,
  social_links jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists studio_availability (
  id uuid primary key default gen_random_uuid(),
  date date not null unique, is_available boolean not null default true, note text,
  booking_id uuid references studio_bookings(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists studio_seo (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique, title text, description text, og_image text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists studio_settings (
  key text primary key, value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists studio_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references studio_bookings(id) on delete cascade,
  sender text not null default 'admin', content text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table studio_projects enable row level security;
alter table studio_articles enable row level security;
alter table studio_services enable row level security;
alter table studio_bookings enable row level security;
alter table studio_testimonials enable row level security;
alter table studio_faqs enable row level security;
alter table studio_team_members enable row level security;
alter table studio_availability enable row level security;
alter table studio_seo enable row level security;
alter table studio_settings enable row level security;
alter table studio_messages enable row level security;

-- updated_at triggers
create or replace function studio_set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_studio_projects_updated before update on studio_projects for each row execute function studio_set_updated_at();
create trigger trg_studio_articles_updated before update on studio_articles for each row execute function studio_set_updated_at();
create trigger trg_studio_services_updated before update on studio_services for each row execute function studio_set_updated_at();
create trigger trg_studio_bookings_updated before update on studio_bookings for each row execute function studio_set_updated_at();
create trigger trg_studio_testimonials_updated before update on studio_testimonials for each row execute function studio_set_updated_at();
create trigger trg_studio_faqs_updated before update on studio_faqs for each row execute function studio_set_updated_at();
create trigger trg_studio_team_members_updated before update on studio_team_members for each row execute function studio_set_updated_at();
create trigger trg_studio_seo_updated before update on studio_seo for each row execute function studio_set_updated_at();
create trigger trg_studio_settings_updated before update on studio_settings for each row execute function studio_set_updated_at();

-- Indexes
create index idx_studio_bookings_status on studio_bookings(status);
create index idx_studio_bookings_created on studio_bookings(created_at desc);
create index idx_studio_projects_published on studio_projects(is_published, sort_order);
create index idx_studio_articles_published on studio_articles(is_published, published_at desc);
create index idx_studio_services_active on studio_services(is_active, sort_order);
create index idx_studio_availability_date on studio_availability(date);
create index idx_studio_messages_booking on studio_messages(booking_id, created_at);
