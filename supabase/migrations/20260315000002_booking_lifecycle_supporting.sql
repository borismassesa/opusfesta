-- ============================================================================
-- Migration: Booking Lifecycle Supporting Tables
-- Slot holds, quotes, contracts, signatures, payments, audit events,
-- resource schedules, blackout periods.
-- ============================================================================

-- 1. Slot holds (15-min temporary reservations)
create table if not exists studio_slot_holds (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references studio_bookings(id) on delete cascade,
  hold_token text not null unique,
  date date not null,
  time_slot text not null,
  resource_id uuid references studio_resources(id) on delete set null,
  held_by_email text,
  held_by_session text,
  expires_at timestamptz not null,
  released_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table studio_slot_holds enable row level security;
create index idx_studio_slot_holds_active
  on studio_slot_holds (date, time_slot, is_active) where is_active = true;
create index idx_studio_slot_holds_expires
  on studio_slot_holds (expires_at) where is_active = true;
create index idx_studio_slot_holds_token
  on studio_slot_holds (hold_token);

-- Prevent double-holding the same slot (only one active hold per date+time_slot)
create unique index idx_studio_slot_holds_unique_active
  on studio_slot_holds (date, time_slot) where is_active = true;

-- 2. Quotes
create table if not exists studio_quotes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references studio_bookings(id) on delete cascade,
  quote_number text not null unique,
  subtotal_tzs bigint not null default 0,
  discount_tzs bigint not null default 0,
  discount_reason text,
  tax_tzs bigint not null default 0,
  total_tzs bigint not null default 0,
  deposit_percent integer not null default 50,
  deposit_amount_tzs bigint not null default 0,
  notes text,
  valid_until timestamptz not null,
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  expired_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table studio_quotes enable row level security;
create trigger trg_studio_quotes_updated
  before update on studio_quotes
  for each row execute function studio_set_updated_at();
create index idx_studio_quotes_booking on studio_quotes(booking_id);

-- 3. Quote line items
create table if not exists studio_quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references studio_quotes(id) on delete cascade,
  description text not null,
  quantity integer not null default 1,
  unit_price_tzs bigint not null,
  total_tzs bigint not null,
  item_type text not null default 'custom' check (item_type in ('package', 'add_on', 'custom')),
  package_id uuid references studio_packages(id) on delete set null,
  add_on_id uuid references studio_add_ons(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table studio_quote_line_items enable row level security;
create index idx_studio_quote_line_items_quote on studio_quote_line_items(quote_id, sort_order);

-- 4. Contracts
create table if not exists studio_contracts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references studio_bookings(id) on delete cascade,
  quote_id uuid references studio_quotes(id) on delete set null,
  contract_number text not null unique,
  content_html text not null,
  sent_at timestamptz,
  sign_deadline timestamptz,
  signed_at timestamptz,
  voided_at timestamptz,
  voided_reason text,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table studio_contracts enable row level security;
create trigger trg_studio_contracts_updated
  before update on studio_contracts
  for each row execute function studio_set_updated_at();
create index idx_studio_contracts_booking on studio_contracts(booking_id);

-- 5. Digital signatures
create table if not exists studio_signatures (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references studio_contracts(id) on delete cascade,
  signer_name text not null,
  signer_email text not null,
  signature_data text not null,
  signature_type text not null check (signature_type in ('draw', 'type')),
  ip_address text,
  user_agent text,
  signed_at timestamptz not null default now()
);

alter table studio_signatures enable row level security;
create index idx_studio_signatures_contract on studio_signatures(contract_id);

-- 6. Payment intents (tracks payment lifecycle before completion)
create table if not exists studio_payment_intents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references studio_bookings(id) on delete cascade,
  payment_type text not null check (payment_type in ('deposit', 'balance', 'reschedule_fee')),
  amount_tzs bigint not null,
  currency text not null default 'TZS',
  provider text not null check (provider in ('flutterwave', 'manual')),
  provider_reference text,
  provider_tx_ref text unique,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  redirect_url text,
  payment_link text,
  initiated_at timestamptz not null default now(),
  completed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table studio_payment_intents enable row level security;
create index idx_studio_payment_intents_booking on studio_payment_intents(booking_id);
create index idx_studio_payment_intents_status on studio_payment_intents(status) where status = 'pending';

-- 7. Payments (completed payment records)
create table if not exists studio_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references studio_bookings(id) on delete cascade,
  payment_intent_id uuid references studio_payment_intents(id) on delete set null,
  payment_type text not null check (payment_type in ('deposit', 'balance', 'reschedule_fee', 'refund')),
  amount_tzs bigint not null,
  currency text not null default 'TZS',
  provider text not null check (provider in ('flutterwave', 'manual')),
  provider_reference text,
  provider_transaction_id text unique,
  receipt_url text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table studio_payments enable row level security;
create index idx_studio_payments_booking on studio_payments(booking_id);

-- 8. Booking events (immutable audit trail)
create table if not exists studio_booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references studio_bookings(id) on delete cascade,
  event_type text not null,
  from_status studio_booking_lifecycle_status,
  to_status studio_booking_lifecycle_status,
  actor text not null,
  description text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table studio_booking_events enable row level security;
create index idx_studio_booking_events_booking on studio_booking_events(booking_id, created_at);

-- 9. Resource schedules (recurring weekly availability per resource)
create table if not exists studio_resource_schedules (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references studio_resources(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table studio_resource_schedules enable row level security;
create trigger trg_studio_resource_schedules_updated
  before update on studio_resource_schedules
  for each row execute function studio_set_updated_at();
create index idx_studio_resource_schedules_resource
  on studio_resource_schedules(resource_id, day_of_week) where is_active = true;

-- 10. Blackout periods
create table if not exists studio_blackout_periods (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references studio_resources(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table studio_blackout_periods enable row level security;
create index idx_studio_blackout_periods_dates on studio_blackout_periods(start_date, end_date);

-- 11. RLS policies: allow service_role full access (admin via supabase-admin client)
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array[
    'studio_client_profiles', 'studio_resources', 'studio_packages', 'studio_add_ons',
    'studio_slot_holds', 'studio_quotes', 'studio_quote_line_items', 'studio_contracts',
    'studio_signatures', 'studio_payment_intents', 'studio_payments',
    'studio_booking_events', 'studio_resource_schedules', 'studio_blackout_periods'
  ]) loop
    execute format(
      'create policy "service_role_all_%1$s" on %1$I for all to service_role using (true) with check (true)',
      tbl
    );
  end loop;
end $$;
