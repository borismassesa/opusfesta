-- ============================================================================
-- OpusFesta Studio — Complete Database Schema
-- Run this in Supabase SQL Editor to set up all studio tables from scratch.
-- Safe to run multiple times (uses IF NOT EXISTS throughout).
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- PART 1: Core CMS Tables (studio_admin_portal)
-- ============================================================================

CREATE TABLE IF NOT EXISTS studio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  number text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  full_description text NOT NULL,
  cover_image text NOT NULL,
  stats jsonb NOT NULL DEFAULT '[]',
  highlights jsonb NOT NULL DEFAULT '[]',
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  body_html text NOT NULL,
  cover_image text NOT NULL,
  author text NOT NULL DEFAULT 'OpusFesta Studio',
  category text NOT NULL,
  published_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price text NOT NULL,
  cover_image text NOT NULL,
  includes jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Legacy booking status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'studio_booking_status') THEN
    CREATE TYPE studio_booking_status AS ENUM ('new','contacted','quoted','confirmed','completed','cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS studio_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  event_type text NOT NULL,
  preferred_date date,
  location text,
  service text,
  message text,
  status studio_booking_status NOT NULL DEFAULT 'new',
  admin_notes text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author text NOT NULL,
  role text NOT NULL,
  avatar_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  avatar_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  social_links jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  note text,
  booking_id uuid REFERENCES studio_bookings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  title text,
  description text,
  og_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES studio_bookings(id) ON DELETE CASCADE,
  sender text NOT NULL DEFAULT 'admin',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- PART 1b: Enable RLS on CMS tables
-- ============================================================================

ALTER TABLE studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_messages ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- PART 1c: Triggers and Indexes for CMS
-- ============================================================================

CREATE OR REPLACE FUNCTION studio_set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_projects_updated') THEN
    CREATE TRIGGER trg_studio_projects_updated BEFORE UPDATE ON studio_projects FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_articles_updated') THEN
    CREATE TRIGGER trg_studio_articles_updated BEFORE UPDATE ON studio_articles FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_services_updated') THEN
    CREATE TRIGGER trg_studio_services_updated BEFORE UPDATE ON studio_services FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_bookings_updated') THEN
    CREATE TRIGGER trg_studio_bookings_updated BEFORE UPDATE ON studio_bookings FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_testimonials_updated') THEN
    CREATE TRIGGER trg_studio_testimonials_updated BEFORE UPDATE ON studio_testimonials FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_faqs_updated') THEN
    CREATE TRIGGER trg_studio_faqs_updated BEFORE UPDATE ON studio_faqs FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_team_members_updated') THEN
    CREATE TRIGGER trg_studio_team_members_updated BEFORE UPDATE ON studio_team_members FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_seo_updated') THEN
    CREATE TRIGGER trg_studio_seo_updated BEFORE UPDATE ON studio_seo FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_settings_updated') THEN
    CREATE TRIGGER trg_studio_settings_updated BEFORE UPDATE ON studio_settings FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_studio_bookings_status ON studio_bookings(status);
CREATE INDEX IF NOT EXISTS idx_studio_bookings_created ON studio_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_projects_published ON studio_projects(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_studio_articles_published ON studio_articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_services_active ON studio_services(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_studio_availability_date ON studio_availability(date);
CREATE INDEX IF NOT EXISTS idx_studio_messages_booking ON studio_messages(booking_id, created_at);


-- ============================================================================
-- PART 2: Availability Time Slots
-- ============================================================================

ALTER TABLE IF EXISTS studio_availability
  ADD COLUMN IF NOT EXISTS time_slot text NOT NULL DEFAULT 'all-day';

ALTER TABLE IF EXISTS studio_availability
  DROP CONSTRAINT IF EXISTS studio_availability_date_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_availability_date_time_slot_unique
  ON studio_availability(date, time_slot);


-- ============================================================================
-- PART 3: Booking Lifecycle Enum + Core Lifecycle Tables
-- ============================================================================

-- 14-state lifecycle enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'studio_booking_lifecycle_status') THEN
    CREATE TYPE studio_booking_lifecycle_status AS ENUM (
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
  END IF;
END $$;

-- Client profiles (repeat client tracking)
CREATE TABLE IF NOT EXISTS studio_client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  phone text,
  whatsapp text,
  company text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_client_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_client_profiles_updated') THEN
    CREATE TRIGGER trg_studio_client_profiles_updated
      BEFORE UPDATE ON studio_client_profiles
      FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
END $$;

-- Resources (staff, rooms, equipment)
CREATE TABLE IF NOT EXISTS studio_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('staff', 'room', 'equipment')),
  description text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_resources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_resources_updated') THEN
    CREATE TRIGGER trg_studio_resources_updated
      BEFORE UPDATE ON studio_resources
      FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
END $$;

-- Packages (service packages with base pricing in TZS)
CREATE TABLE IF NOT EXISTS studio_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES studio_services(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  base_price_tzs bigint NOT NULL,
  duration_minutes integer,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_packages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_packages_updated') THEN
    CREATE TRIGGER trg_studio_packages_updated
      BEFORE UPDATE ON studio_packages
      FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_studio_packages_service ON studio_packages(service_id, is_active, sort_order);

-- Add-ons
CREATE TABLE IF NOT EXISTS studio_add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_tzs bigint NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_add_ons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_add_ons_updated') THEN
    CREATE TRIGGER trg_studio_add_ons_updated
      BEFORE UPDATE ON studio_add_ons
      FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
END $$;

-- Extend studio_bookings with lifecycle columns
ALTER TABLE studio_bookings
  ADD COLUMN IF NOT EXISTS lifecycle_status studio_booking_lifecycle_status DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES studio_client_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS package_id uuid REFERENCES studio_packages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_resource_id uuid REFERENCES studio_resources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS event_time_slot text,
  ADD COLUMN IF NOT EXISTS event_end_date date,
  ADD COLUMN IF NOT EXISTS guest_count integer,
  ADD COLUMN IF NOT EXISTS total_amount_tzs bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_amount_tzs bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due_tzs bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due_date date,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'TZS',
  ADD COLUMN IF NOT EXISTS reschedule_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_override_by text,
  ADD COLUMN IF NOT EXISTS admin_override_reason text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_studio_bookings_lifecycle ON studio_bookings(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_studio_bookings_event_date ON studio_bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_studio_bookings_client ON studio_bookings(client_id);


-- ============================================================================
-- PART 4: Booking Lifecycle Supporting Tables
-- ============================================================================

-- Slot holds (15-min temporary reservations)
CREATE TABLE IF NOT EXISTS studio_slot_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES studio_bookings(id) ON DELETE CASCADE,
  hold_token text NOT NULL UNIQUE,
  date date NOT NULL,
  time_slot text NOT NULL,
  resource_id uuid REFERENCES studio_resources(id) ON DELETE SET NULL,
  held_by_email text,
  held_by_session text,
  expires_at timestamptz NOT NULL,
  released_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_slot_holds ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_studio_slot_holds_active
  ON studio_slot_holds (date, time_slot, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_studio_slot_holds_expires
  ON studio_slot_holds (expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_studio_slot_holds_token
  ON studio_slot_holds (hold_token);

-- Prevent double-holding the same date+timeslot
CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_slot_holds_unique_active
  ON studio_slot_holds (date, time_slot) WHERE is_active = true;

-- Quotes
CREATE TABLE IF NOT EXISTS studio_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES studio_bookings(id) ON DELETE CASCADE,
  quote_number text NOT NULL UNIQUE,
  subtotal_tzs bigint NOT NULL DEFAULT 0,
  discount_tzs bigint NOT NULL DEFAULT 0,
  discount_reason text,
  tax_tzs bigint NOT NULL DEFAULT 0,
  total_tzs bigint NOT NULL DEFAULT 0,
  deposit_percent integer NOT NULL DEFAULT 50,
  deposit_amount_tzs bigint NOT NULL DEFAULT 0,
  notes text,
  valid_until timestamptz NOT NULL,
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  expired_at timestamptz,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_quotes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_quotes_updated') THEN
    CREATE TRIGGER trg_studio_quotes_updated
      BEFORE UPDATE ON studio_quotes
      FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_studio_quotes_booking ON studio_quotes(booking_id);

-- Quote line items
CREATE TABLE IF NOT EXISTS studio_quote_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES studio_quotes(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price_tzs bigint NOT NULL,
  total_tzs bigint NOT NULL,
  item_type text NOT NULL DEFAULT 'custom' CHECK (item_type IN ('package', 'add_on', 'custom')),
  package_id uuid REFERENCES studio_packages(id) ON DELETE SET NULL,
  add_on_id uuid REFERENCES studio_add_ons(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_quote_line_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_studio_quote_line_items_quote ON studio_quote_line_items(quote_id, sort_order);

-- Contracts
CREATE TABLE IF NOT EXISTS studio_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES studio_bookings(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES studio_quotes(id) ON DELETE SET NULL,
  contract_number text NOT NULL UNIQUE,
  content_html text NOT NULL,
  sent_at timestamptz,
  sign_deadline timestamptz,
  signed_at timestamptz,
  voided_at timestamptz,
  voided_reason text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_contracts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_contracts_updated') THEN
    CREATE TRIGGER trg_studio_contracts_updated
      BEFORE UPDATE ON studio_contracts
      FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_studio_contracts_booking ON studio_contracts(booking_id);

-- Digital signatures
CREATE TABLE IF NOT EXISTS studio_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES studio_contracts(id) ON DELETE CASCADE,
  signer_name text NOT NULL,
  signer_email text NOT NULL,
  signature_data text NOT NULL,
  signature_type text NOT NULL CHECK (signature_type IN ('draw', 'type')),
  ip_address text,
  user_agent text,
  signed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_signatures ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_studio_signatures_contract ON studio_signatures(contract_id);

-- Payment intents (tracks payment lifecycle before completion)
CREATE TABLE IF NOT EXISTS studio_payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES studio_bookings(id) ON DELETE CASCADE,
  payment_type text NOT NULL CHECK (payment_type IN ('deposit', 'balance', 'reschedule_fee')),
  amount_tzs bigint NOT NULL,
  currency text NOT NULL DEFAULT 'TZS',
  provider text NOT NULL CHECK (provider IN ('flutterwave', 'manual')),
  provider_reference text,
  provider_tx_ref text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  redirect_url text,
  payment_link text,
  initiated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_payment_intents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_studio_payment_intents_booking ON studio_payment_intents(booking_id);
CREATE INDEX IF NOT EXISTS idx_studio_payment_intents_status ON studio_payment_intents(status) WHERE status = 'pending';

-- Completed payments
CREATE TABLE IF NOT EXISTS studio_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES studio_bookings(id) ON DELETE CASCADE,
  payment_intent_id uuid REFERENCES studio_payment_intents(id) ON DELETE SET NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('deposit', 'balance', 'reschedule_fee', 'refund')),
  amount_tzs bigint NOT NULL,
  currency text NOT NULL DEFAULT 'TZS',
  provider text NOT NULL CHECK (provider IN ('flutterwave', 'manual')),
  provider_reference text,
  provider_transaction_id text UNIQUE,
  receipt_url text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_payments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_studio_payments_booking ON studio_payments(booking_id);

-- Booking events (immutable audit trail)
CREATE TABLE IF NOT EXISTS studio_booking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES studio_bookings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  from_status studio_booking_lifecycle_status,
  to_status studio_booking_lifecycle_status,
  actor text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_booking_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_studio_booking_events_booking ON studio_booking_events(booking_id, created_at);

-- Resource schedules (recurring weekly availability)
CREATE TABLE IF NOT EXISTS studio_resource_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES studio_resources(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_resource_schedules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_studio_resource_schedules_updated') THEN
    CREATE TRIGGER trg_studio_resource_schedules_updated
      BEFORE UPDATE ON studio_resource_schedules
      FOR EACH ROW EXECUTE FUNCTION studio_set_updated_at();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_studio_resource_schedules_resource
  ON studio_resource_schedules(resource_id, day_of_week) WHERE is_active = true;

-- Blackout periods
CREATE TABLE IF NOT EXISTS studio_blackout_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES studio_resources(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE studio_blackout_periods ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_studio_blackout_periods_dates ON studio_blackout_periods(start_date, end_date);


-- ============================================================================
-- PART 5: RLS Policies — service_role full access on ALL tables
-- ============================================================================

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'studio_bookings', 'studio_projects', 'studio_articles', 'studio_services',
    'studio_testimonials', 'studio_faqs', 'studio_team_members', 'studio_availability',
    'studio_seo', 'studio_settings', 'studio_messages',
    'studio_client_profiles', 'studio_resources', 'studio_packages', 'studio_add_ons',
    'studio_slot_holds', 'studio_quotes', 'studio_quote_line_items', 'studio_contracts',
    'studio_signatures', 'studio_payment_intents', 'studio_payments',
    'studio_booking_events', 'studio_resource_schedules', 'studio_blackout_periods'
  ]) LOOP
    -- Drop existing policy if present, then create
    EXECUTE format(
      'DROP POLICY IF EXISTS "service_role_all_%1$s" ON %1$I', tbl
    );
    EXECUTE format(
      'CREATE POLICY "service_role_all_%1$s" ON %1$I FOR ALL TO service_role USING (true) WITH CHECK (true)', tbl
    );
  END LOOP;
END $$;

-- Public read policies for anonymous access (booking frontend)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'studio_services' AND policyname = 'anon_read_studio_services') THEN
    CREATE POLICY "anon_read_studio_services" ON studio_services FOR SELECT TO anon USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'studio_settings' AND policyname = 'anon_read_studio_settings') THEN
    CREATE POLICY "anon_read_studio_settings" ON studio_settings FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'studio_packages' AND policyname = 'anon_read_studio_packages') THEN
    CREATE POLICY "anon_read_studio_packages" ON studio_packages FOR SELECT TO anon USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'studio_projects' AND policyname = 'anon_read_studio_projects') THEN
    CREATE POLICY "anon_read_studio_projects" ON studio_projects FOR SELECT TO anon USING (is_published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'studio_articles' AND policyname = 'anon_read_studio_articles') THEN
    CREATE POLICY "anon_read_studio_articles" ON studio_articles FOR SELECT TO anon USING (is_published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'studio_testimonials' AND policyname = 'anon_read_studio_testimonials') THEN
    CREATE POLICY "anon_read_studio_testimonials" ON studio_testimonials FOR SELECT TO anon USING (is_published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'studio_faqs' AND policyname = 'anon_read_studio_faqs') THEN
    CREATE POLICY "anon_read_studio_faqs" ON studio_faqs FOR SELECT TO anon USING (is_published = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'studio_team_members' AND policyname = 'anon_read_studio_team_members') THEN
    CREATE POLICY "anon_read_studio_team_members" ON studio_team_members FOR SELECT TO anon USING (is_published = true);
  END IF;
END $$;


-- ============================================================================
-- PART 6: PL/pgSQL Functions (Slot Hold Expiry, Quote Expiry)
-- ============================================================================

-- Expire stale slot holds
CREATE OR REPLACE FUNCTION expire_studio_slot_holds()
RETURNS integer AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE studio_slot_holds
  SET is_active = false, released_at = now()
  WHERE is_active = true AND expires_at < now();
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Expire quotes past valid_until
CREATE OR REPLACE FUNCTION expire_studio_quotes()
RETURNS integer AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE studio_quotes
  SET expired_at = now()
  WHERE expired_at IS NULL
    AND accepted_at IS NULL
    AND rejected_at IS NULL
    AND valid_until < now();
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Find contracts past sign deadline
CREATE OR REPLACE FUNCTION find_expired_studio_contracts()
RETURNS TABLE(contract_id uuid, booking_id uuid) AS $$
BEGIN
  RETURN QUERY
    SELECT c.id AS contract_id, c.booking_id
    FROM studio_contracts c
    WHERE c.signed_at IS NULL
      AND c.voided_at IS NULL
      AND c.sign_deadline IS NOT NULL
      AND c.sign_deadline < now();
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- PART 7: Seed default working hours
-- ============================================================================

INSERT INTO studio_settings (key, value)
VALUES (
  'working_hours',
  '{
    "monday":    { "open": true,  "from": "09:00", "to": "18:00" },
    "tuesday":   { "open": true,  "from": "09:00", "to": "18:00" },
    "wednesday": { "open": true,  "from": "09:00", "to": "18:00" },
    "thursday":  { "open": true,  "from": "09:00", "to": "18:00" },
    "friday":    { "open": true,  "from": "09:00", "to": "18:00" },
    "saturday":  { "open": true,  "from": "10:00", "to": "16:00" },
    "sunday":    { "open": false, "from": "09:00", "to": "18:00" }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;


-- ============================================================================
-- DONE! All studio tables, indexes, RLS policies, and functions are set up.
-- ============================================================================
