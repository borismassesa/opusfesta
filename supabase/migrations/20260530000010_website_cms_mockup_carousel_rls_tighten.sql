-- Tighten RLS on website_cms_mockup_carousel
--
-- The original migration (20260529000003_website_cms_mockup_carousel.sql)
-- created a policy named "Service role full access on website_cms_mockup_carousel"
-- using `for all using (true) with check (true)` with no `TO` clause. In
-- Postgres, omitting TO defaults to PUBLIC — the policy grants SELECT/INSERT/
-- UPDATE/DELETE to every role including `anon`, which the public site's
-- publishable key represents. The intent was service-role-only; the effect
-- was fully public read AND write via the Supabase REST API.
--
-- Fix: drop the over-permissive policy, then add two narrowly-scoped policies:
--   • Anyone can SELECT (public site needs to render the carousel).
--   • Only service_role can write (admin server actions use the service-role
--     client; RLS bypass already applies to them, but the explicit policy is
--     defense-in-depth and makes intent clear to future readers).

DROP POLICY IF EXISTS "Service role full access on website_cms_mockup_carousel"
  ON website_cms_mockup_carousel;

DROP POLICY IF EXISTS "anyone can read mockup carousel"
  ON website_cms_mockup_carousel;
CREATE POLICY "anyone can read mockup carousel"
  ON website_cms_mockup_carousel
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "service role manages mockup carousel"
  ON website_cms_mockup_carousel;
CREATE POLICY "service role manages mockup carousel"
  ON website_cms_mockup_carousel
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
