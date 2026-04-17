-- ============================================================================
-- Studio Inquiries
-- Lightweight lead capture for the showcase site.
-- Replaces the booking intake flow (which was transactional scaffold, now removed).
-- A new row is inserted per contact form submission; admins manage via /studio-admin/inquiries.
-- ============================================================================

-- Shared updated_at trigger function — defined idempotently here so this
-- migration is self-sufficient regardless of whether earlier studio migrations
-- (20260309_studio_admin_portal.sql) have been applied.
create or replace function studio_set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists studio_inquiries (
  id uuid primary key default gen_random_uuid(),

  -- Contact info
  name text not null,
  email text not null,
  phone text,

  -- Project details
  project_type text,
  budget_range text,
  timeline text,
  message text,

  -- Triage
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'closed_won', 'closed_lost', 'spam')),
  assigned_to text,       -- Clerk user id of the admin who owns this lead
  internal_notes text,

  -- Lifecycle
  contacted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table studio_inquiries enable row level security;

-- Service role has full access (admin routes use service role key)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'studio_inquiries'
      and policyname = 'service_role_all_studio_inquiries'
  ) then
    create policy "service_role_all_studio_inquiries" on studio_inquiries
      for all to service_role using (true) with check (true);
  end if;
end $$;

-- Anon can INSERT (public contact form); cannot SELECT or UPDATE.
-- The /api/inquiries route validates input before insert.
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'studio_inquiries'
      and policyname = 'anon_insert_studio_inquiries'
  ) then
    create policy "anon_insert_studio_inquiries" on studio_inquiries
      for insert to anon with check (true);
  end if;
end $$;

-- Reuse shared updated_at trigger defined in 20260309_studio_admin_portal.sql
create trigger trg_studio_inquiries_updated
  before update on studio_inquiries
  for each row execute function studio_set_updated_at();

-- Indexes for the admin inbox
create index idx_studio_inquiries_status_created
  on studio_inquiries(status, created_at desc);
create index idx_studio_inquiries_assigned
  on studio_inquiries(assigned_to) where assigned_to is not null;
create index idx_studio_inquiries_created
  on studio_inquiries(created_at desc);
