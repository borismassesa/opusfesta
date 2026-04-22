-- ============================================================================
-- Studio Bookings — Slice 1a
-- Admin-managed bookings table. Powers the /studio-admin/bookings module.
--
-- Scope of this slice:
--   • Admin CRUD only (no public booking widget yet — that's Slice 2).
--   • Simple schedule fields (date + start_time + duration_minutes).
--   • Status machine: pending → confirmed → in_progress → completed
--     with cancelled / no_show as terminal off-ramps.
--   • Commercial fields stored as TZS integers (whole shillings).
--
-- Out of scope here (deliberately):
--   • studio_availability (weekday rules, blackouts) — Slice 2.
--   • Conflict detection / overlap enforcement — Slice 2, server-validated.
--   • Payment intents / invoices — Payments P1 slice.
-- ============================================================================

-- Reuse the shared updated_at trigger function (idempotent).
create or replace function studio_set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists studio_bookings (
  id uuid primary key default gen_random_uuid(),

  -- ── Client ────────────────────────────────────────────────────────────
  -- Denormalised for now. When studio_clients (CRM lite) lands in P2,
  -- add client_id uuid references studio_clients(id) and keep these as
  -- a snapshot of what the client provided at booking time.
  client_name  text not null,
  client_email text not null,
  client_phone text,

  -- ── Service ───────────────────────────────────────────────────────────
  -- Soft reference to studio_documents(id) where type='service'. Not an FK
  -- so services can be archived without breaking historical bookings.
  -- service_name is a snapshot (service titles can drift over time).
  service_id   uuid,
  service_name text,

  -- ── Schedule ──────────────────────────────────────────────────────────
  booking_date     date not null,
  start_time       time not null,
  duration_minutes int  not null default 60 check (duration_minutes > 0 and duration_minutes <= 1440),

  -- ── Status ────────────────────────────────────────────────────────────
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),

  -- ── Commercials (TZS, whole shillings — TZS has no sub-unit in practice) ─
  quoted_amount_tzs   bigint check (quoted_amount_tzs is null or quoted_amount_tzs >= 0),
  deposit_amount_tzs  bigint check (deposit_amount_tzs is null or deposit_amount_tzs >= 0),
  deposit_paid        boolean not null default false,

  -- ── Detail ────────────────────────────────────────────────────────────
  location       text,
  notes          text,
  internal_notes text,

  -- ── Lifecycle timestamps ──────────────────────────────────────────────
  confirmed_at        timestamptz,
  completed_at        timestamptz,
  cancelled_at        timestamptz,
  cancellation_reason text,

  -- ── Audit ─────────────────────────────────────────────────────────────
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,                -- soft delete
  created_by text,                       -- Clerk user id
  updated_by text                        -- Clerk user id
);

-- ── RLS: service role only. Admin routes use the service role key; no anon
--      write yet. When the public booking widget lands, add a scoped insert
--      policy with server-side validation in /api/bookings. ───────────────
alter table studio_bookings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'studio_bookings'
      and policyname = 'service_role_all_studio_bookings'
  ) then
    create policy "service_role_all_studio_bookings" on studio_bookings
      for all to service_role using (true) with check (true);
  end if;
end $$;

-- ── Trigger: auto-bump updated_at on every update ────────────────────────
drop trigger if exists trg_studio_bookings_updated on studio_bookings;
create trigger trg_studio_bookings_updated
  before update on studio_bookings
  for each row execute function studio_set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────────────────
-- Calendar queries: "all bookings on this day / week / month".
create index if not exists idx_studio_bookings_date
  on studio_bookings(booking_date, start_time)
  where deleted_at is null;

-- Status filters in admin list.
create index if not exists idx_studio_bookings_status_date
  on studio_bookings(status, booking_date desc)
  where deleted_at is null;

-- Client lookup (for future CRM linking and duplicate detection).
create index if not exists idx_studio_bookings_client_email
  on studio_bookings(lower(client_email))
  where deleted_at is null;

-- Service roll-ups.
create index if not exists idx_studio_bookings_service
  on studio_bookings(service_id)
  where service_id is not null and deleted_at is null;
