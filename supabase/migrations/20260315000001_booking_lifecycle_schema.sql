-- ============================================================================
-- Migration: Booking Lifecycle Schema (Core Tables)
-- Adds lifecycle enum, client profiles, resources, packages, add-ons,
-- and extends studio_bookings with lifecycle columns.
-- ============================================================================

-- 1. Lifecycle status enum
do $$ begin
  if not exists (select 1 from pg_type where typname = 'studio_booking_lifecycle_status') then
    create type studio_booking_lifecycle_status as enum (
      'draft',
      'slot_held',
      'intake_submitted',
      'qualified',
      'quote_sent',
      'quote_accepted',
      'contract_sent',
      'contract_signed',
      'deposit_pending',
      'confirmed',
      'reschedule_requested',
      'rescheduled',
      'completed',
      'cancelled'
    );
  end if;
end $$;

-- 2. Client profiles (repeat client tracking)
create table if not exists studio_client_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  phone text,
  whatsapp text,
  company text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table studio_client_profiles enable row level security;
create trigger trg_studio_client_profiles_updated
  before update on studio_client_profiles
  for each row execute function studio_set_updated_at();

-- 3. Resources (staff, rooms, equipment)
create table if not exists studio_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('staff', 'room', 'equipment')),
  description text,
  is_active boolean not null default true,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table studio_resources enable row level security;
create trigger trg_studio_resources_updated
  before update on studio_resources
  for each row execute function studio_set_updated_at();

-- 4. Packages (service packages with base pricing)
create table if not exists studio_packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references studio_services(id) on delete set null,
  name text not null,
  description text,
  base_price_tzs bigint not null,
  duration_minutes integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table studio_packages enable row level security;
create trigger trg_studio_packages_updated
  before update on studio_packages
  for each row execute function studio_set_updated_at();
create index idx_studio_packages_service on studio_packages(service_id, is_active, sort_order);

-- 5. Add-ons
create table if not exists studio_add_ons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_tzs bigint not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table studio_add_ons enable row level security;
create trigger trg_studio_add_ons_updated
  before update on studio_add_ons
  for each row execute function studio_set_updated_at();

-- 6. Extend studio_bookings with lifecycle columns
alter table studio_bookings
  add column if not exists lifecycle_status studio_booking_lifecycle_status default 'draft',
  add column if not exists client_id uuid references studio_client_profiles(id) on delete set null,
  add column if not exists package_id uuid references studio_packages(id) on delete set null,
  add column if not exists assigned_resource_id uuid references studio_resources(id) on delete set null,
  add column if not exists event_date date,
  add column if not exists event_time_slot text,
  add column if not exists event_end_date date,
  add column if not exists guest_count integer,
  add column if not exists total_amount_tzs bigint default 0,
  add column if not exists deposit_amount_tzs bigint default 0,
  add column if not exists balance_due_tzs bigint default 0,
  add column if not exists balance_due_date date,
  add column if not exists currency text default 'TZS',
  add column if not exists reschedule_count integer default 0,
  add column if not exists cancellation_reason text,
  add column if not exists cancelled_at timestamptz,
  add column if not exists confirmed_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists admin_override_by text,
  add column if not exists admin_override_reason text,
  add column if not exists metadata jsonb default '{}';

create index if not exists idx_studio_bookings_lifecycle on studio_bookings(lifecycle_status);
create index if not exists idx_studio_bookings_event_date on studio_bookings(event_date);
create index if not exists idx_studio_bookings_client on studio_bookings(client_id);
