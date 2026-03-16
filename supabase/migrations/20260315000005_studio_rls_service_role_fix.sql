-- ============================================================================
-- Fix: Add service_role full-access RLS policies to original Studio tables
-- The original 20260309 migration enabled RLS but only the lifecycle migration
-- (20260315000002) added service_role policies — and only for the new tables.
-- The booking service uses supabase-admin (service_role) and needs access to all.
-- ============================================================================

-- studio_bookings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_bookings' AND policyname = 'service_role_all_studio_bookings'
  ) THEN
    CREATE POLICY "service_role_all_studio_bookings" ON studio_bookings
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_services
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_services' AND policyname = 'service_role_all_studio_services'
  ) THEN
    CREATE POLICY "service_role_all_studio_services" ON studio_services
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_availability
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_availability' AND policyname = 'service_role_all_studio_availability'
  ) THEN
    CREATE POLICY "service_role_all_studio_availability" ON studio_availability
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_settings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_settings' AND policyname = 'service_role_all_studio_settings'
  ) THEN
    CREATE POLICY "service_role_all_studio_settings" ON studio_settings
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_messages
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_messages' AND policyname = 'service_role_all_studio_messages'
  ) THEN
    CREATE POLICY "service_role_all_studio_messages" ON studio_messages
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_projects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_projects' AND policyname = 'service_role_all_studio_projects'
  ) THEN
    CREATE POLICY "service_role_all_studio_projects" ON studio_projects
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_articles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_articles' AND policyname = 'service_role_all_studio_articles'
  ) THEN
    CREATE POLICY "service_role_all_studio_articles" ON studio_articles
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_testimonials
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_testimonials' AND policyname = 'service_role_all_studio_testimonials'
  ) THEN
    CREATE POLICY "service_role_all_studio_testimonials" ON studio_testimonials
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_faqs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_faqs' AND policyname = 'service_role_all_studio_faqs'
  ) THEN
    CREATE POLICY "service_role_all_studio_faqs" ON studio_faqs
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_team_members
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_team_members' AND policyname = 'service_role_all_studio_team_members'
  ) THEN
    CREATE POLICY "service_role_all_studio_team_members" ON studio_team_members
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- studio_seo
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_seo' AND policyname = 'service_role_all_studio_seo'
  ) THEN
    CREATE POLICY "service_role_all_studio_seo" ON studio_seo
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Also add anon read policy for public-facing tables (services, settings, availability)
-- so the public booking API can read them without auth

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_services' AND policyname = 'anon_read_studio_services'
  ) THEN
    CREATE POLICY "anon_read_studio_services" ON studio_services
      FOR SELECT TO anon USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_settings' AND policyname = 'anon_read_studio_settings'
  ) THEN
    CREATE POLICY "anon_read_studio_settings" ON studio_settings
      FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'studio_packages' AND policyname = 'anon_read_studio_packages'
  ) THEN
    CREATE POLICY "anon_read_studio_packages" ON studio_packages
      FOR SELECT TO anon USING (is_active = true);
  END IF;
END $$;
