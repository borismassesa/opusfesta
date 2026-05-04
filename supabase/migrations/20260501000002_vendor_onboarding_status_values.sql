-- Migration: add new vendor_onboarding_status enum values
--
-- This migration must run BEFORE 20260501000003_vendor_verification_b_lite.sql,
-- which migrates existing rows onto these new values and creates RLS-bound
-- tables that reference them.
--
-- Why split? Postgres 12+ disallows using a value added by ALTER TYPE ADD
-- VALUE inside the same transaction. Supabase wraps each migration file in a
-- transaction, so the value additions must commit (i.e. land in their own
-- migration file) before any subsequent migration can reference the new
-- values as enum literals.
--
-- The legacy values (invited, in_progress, pending_review) remain in the enum
-- as harmless aliases — that lets policies / triggers / app code referencing
-- them by name keep working until a future cleanup migration drops them once
-- nothing in the wild still writes the old names.

ALTER TYPE vendor_onboarding_status ADD VALUE IF NOT EXISTS 'application_in_progress';
ALTER TYPE vendor_onboarding_status ADD VALUE IF NOT EXISTS 'verification_pending';
ALTER TYPE vendor_onboarding_status ADD VALUE IF NOT EXISTS 'admin_review';
ALTER TYPE vendor_onboarding_status ADD VALUE IF NOT EXISTS 'needs_corrections';
