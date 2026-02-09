-- Migration: Drop verification_codes table
-- This table was used for custom email verification and password reset flows
-- with Supabase Auth. Now that Clerk handles these natively, this table is
-- no longer needed.

DROP TABLE IF EXISTS verification_codes;
