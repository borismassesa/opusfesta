-- Migration 054: Retarget foreign keys from auth.users to public.users
-- Two tables have direct FKs to auth.users(id) that need to point to public.users(id)

-- 1. verification_codes (will be dropped in Phase 3, but fix FK now)
ALTER TABLE verification_codes
  DROP CONSTRAINT IF EXISTS verification_codes_user_id_fkey;
ALTER TABLE verification_codes
  ADD CONSTRAINT verification_codes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. job_applications
ALTER TABLE job_applications
  DROP CONSTRAINT IF EXISTS job_applications_user_id_fkey;
ALTER TABLE job_applications
  ADD CONSTRAINT job_applications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
