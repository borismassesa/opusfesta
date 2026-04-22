-- ============================================================================
-- Studio Availability — Slice 2
-- Two tables that define when the studio is open for booking:
--   • studio_availability  → recurring weekday rules (hours per day of week)
--   • studio_blackouts     → explicit closed date ranges (holidays, travel, etc.)
--
-- These feed the admin calendar (visual blocked slots) and the server-side
-- conflict check on /api/admin/bookings POST/PATCH — no booking can be
-- written outside working hours, on a blackout, or overlapping another live
-- booking on the same day.
-- ============================================================================

-- Reuse the shared updated_at trigger function (idempotent).
create or replace function studio_set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Weekday rules ────────────────────────────────────────────────────────
-- JS convention: 0 = Sunday, 6 = Saturday. Exactly 7 rows, one per weekday.
create table if not exists studio_availability (
  weekday     smallint primary key check (weekday between 0 and 6),
  is_open     boolean  not null default true,
  open_time   time     not null default '09:00',
  close_time  time     not null default '18:00',
  updated_at  timestamptz not null default now(),
  updated_by  text,
  check (close_time > open_time)
);

-- Seed defaults: all 7 days open, 09:00–18:00. Admin can edit.
insert into studio_availability (weekday, is_open, open_time, close_time) values
  (0, true, '09:00', '18:00'),
  (1, true, '09:00', '18:00'),
  (2, true, '09:00', '18:00'),
  (3, true, '09:00', '18:00'),
  (4, true, '09:00', '18:00'),
  (5, true, '09:00', '18:00'),
  (6, true, '09:00', '18:00')
on conflict (weekday) do nothing;

alter table studio_availability enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'studio_availability'
      and policyname = 'service_role_all_studio_availability'
  ) then
    create policy "service_role_all_studio_availability" on studio_availability
      for all to service_role using (true) with check (true);
  end if;
end $$;

drop trigger if exists trg_studio_availability_updated on studio_availability;
create trigger trg_studio_availability_updated
  before update on studio_availability
  for each row execute function studio_set_updated_at();

-- ── Blackout date ranges ─────────────────────────────────────────────────
-- Inclusive on both ends. A single-day blackout is start_date = end_date.
create table if not exists studio_blackouts (
  id          uuid primary key default gen_random_uuid(),
  start_date  date not null,
  end_date    date not null,
  reason      text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  text,
  updated_by  text,
  check (end_date >= start_date)
);

alter table studio_blackouts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'studio_blackouts'
      and policyname = 'service_role_all_studio_blackouts'
  ) then
    create policy "service_role_all_studio_blackouts" on studio_blackouts
      for all to service_role using (true) with check (true);
  end if;
end $$;

drop trigger if exists trg_studio_blackouts_updated on studio_blackouts;
create trigger trg_studio_blackouts_updated
  before update on studio_blackouts
  for each row execute function studio_set_updated_at();

-- Calendar range queries scan by overlap; index supports either end.
create index if not exists idx_studio_blackouts_range
  on studio_blackouts (start_date, end_date);
