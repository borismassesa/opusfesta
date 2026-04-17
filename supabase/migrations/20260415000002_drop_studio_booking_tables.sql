-- ============================================================================
-- Phase 0: Drop the studio booking lifecycle scaffold.
--
-- The studio app is now a pure marketing/showcase site with lightweight
-- inquiry capture (see 20260415000001_studio_inquiries.sql).
-- All booking lifecycle, client portal, quotes, contracts, payments,
-- resources, availability, slot holds, and booking-scoped messaging
-- tables are removed.
--
-- This migration is destructive — it drops tables, enum types, and
-- helper functions. The content tables (studio_projects, studio_articles,
-- studio_services, studio_testimonials, studio_faqs, studio_team_members,
-- studio_seo, studio_settings, studio_page_sections) remain intact.
-- ============================================================================

-- Drop in an order that respects foreign key dependencies.
-- CASCADE on the final tables handles any remaining references.

-- Client auth (sessions + magic links depend on client_profiles)
drop table if exists studio_client_sessions cascade;
drop table if exists studio_client_magic_links cascade;

-- Quote line items → quotes → contracts/signatures
drop table if exists studio_signatures cascade;
drop table if exists studio_quote_line_items cascade;
drop table if exists studio_contracts cascade;
drop table if exists studio_quotes cascade;

-- Payments
drop table if exists studio_payments cascade;
drop table if exists studio_payment_intents cascade;

-- Audit trail
drop table if exists studio_booking_events cascade;

-- Slot holds & availability
drop table if exists studio_slot_holds cascade;
drop table if exists studio_availability cascade;

-- Resource scheduling
drop table if exists studio_resource_schedules cascade;
drop table if exists studio_blackout_periods cascade;

-- Messages (tied to bookings)
drop table if exists studio_messages cascade;

-- Core booking & catalog tables
drop table if exists studio_bookings cascade;
drop table if exists studio_packages cascade;
drop table if exists studio_add_ons cascade;
drop table if exists studio_resources cascade;
drop table if exists studio_client_profiles cascade;

-- Drop booking-specific enum types
drop type if exists studio_booking_lifecycle_status;
drop type if exists studio_booking_status;

-- Drop helper functions only used by dropped tables
drop function if exists cleanup_studio_client_auth();
drop function if exists update_studio_messages_updated_at();

-- NOTE: studio_set_updated_at() is intentionally preserved — it is still used
-- by studio_projects, studio_articles, studio_services, studio_testimonials,
-- studio_faqs, studio_team_members, studio_seo, studio_settings, and the new
-- studio_inquiries table.
