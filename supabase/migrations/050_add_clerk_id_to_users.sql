-- Migration 050: Add clerk_id column to public.users for Clerk integration
-- This maps Clerk's string-based user IDs (e.g., user_2abc123) to existing UUID-based rows

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);
