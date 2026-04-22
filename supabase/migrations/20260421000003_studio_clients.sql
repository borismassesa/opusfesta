-- ============================================================================
-- Studio Clients (CRM lite) — Slice 3
--
-- Auto-created from the email on every booking so the admin never has to
-- manually enter client data. Each client carries contact details, notes,
-- tags, and a link-back to all their bookings.
--
-- Email (case-insensitive) is the identity key. If an admin later changes
-- a client's email, old bookings retain their original email snapshot — the
-- client_id on the booking is the stable link.
-- ============================================================================

create or replace function studio_set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists studio_clients (
  id uuid primary key default gen_random_uuid(),

  name  text not null,
  email text not null,
  phone text,

  notes text,              -- admin-only internal notes
  tags  text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by text,
  updated_by text
);

-- Email uniqueness (case-insensitive). Partial so soft-deleted rows
-- don't block re-adding a client with the same email.
create unique index if not exists ux_studio_clients_email_lower
  on studio_clients (lower(email))
  where deleted_at is null;

create index if not exists idx_studio_clients_created
  on studio_clients (created_at desc)
  where deleted_at is null;

-- RLS: service role only. Admin routes go through the service role key.
alter table studio_clients enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'studio_clients'
      and policyname = 'service_role_all_studio_clients'
  ) then
    create policy "service_role_all_studio_clients" on studio_clients
      for all to service_role using (true) with check (true);
  end if;
end $$;

drop trigger if exists trg_studio_clients_updated on studio_clients;
create trigger trg_studio_clients_updated
  before update on studio_clients
  for each row execute function studio_set_updated_at();

-- ── Link bookings → clients ──────────────────────────────────────────────
alter table studio_bookings
  add column if not exists client_id uuid references studio_clients(id) on delete set null;

create index if not exists idx_studio_bookings_client_id
  on studio_bookings (client_id)
  where client_id is not null;

-- ── Backfill ─────────────────────────────────────────────────────────────
-- Create one client per unique email across existing bookings, using the
-- most recent name/phone seen. Then link each booking to its client.
insert into studio_clients (name, email, phone, created_at, updated_at)
select
  (array_agg(client_name order by created_at desc))[1]                         as name,
  lower(client_email)                                                          as email,
  (array_agg(client_phone order by created_at desc) filter (where client_phone is not null))[1] as phone,
  min(created_at),
  max(updated_at)
from studio_bookings
where deleted_at is null and client_email is not null
group by lower(client_email)
on conflict do nothing;

update studio_bookings b
set client_id = c.id
from studio_clients c
where lower(b.client_email) = lower(c.email)
  and b.client_id is null
  and b.deleted_at is null
  and c.deleted_at is null;
