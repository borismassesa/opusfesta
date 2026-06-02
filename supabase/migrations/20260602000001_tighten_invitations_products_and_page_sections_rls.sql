-- Tighten RLS on website_invitations_products and website_page_sections
--
-- Both tables were created with a policy `for all using (true) with check (true)`
-- and NO `TO` clause. In Postgres, omitting TO defaults to PUBLIC, so the policy
-- grants SELECT/INSERT/UPDATE/DELETE to every role — including `anon`, which the
-- public sites' publishable key represents. The intent was service-role-only;
-- the effect is that anyone with the (bundled) anon key can rewrite product
-- prices, unpublish products, or edit any CMS page section via the REST API.
--
-- This mirrors the fix already applied to website_cms_mockup_carousel
-- (20260530000010): drop the over-permissive policy, then
--   • Anyone can SELECT (the public sites render products / page sections).
--   • Only service_role can write (admin server actions use the service-role
--     client, which bypasses RLS anyway — the explicit policy is defense-in-depth
--     and documents intent).

-- ── website_invitations_products ──
DROP POLICY IF EXISTS "Service role full access on website_invitations_products"
  ON website_invitations_products;

DROP POLICY IF EXISTS "anyone can read invitations products"
  ON website_invitations_products;
CREATE POLICY "anyone can read invitations products"
  ON website_invitations_products
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "service role manages invitations products"
  ON website_invitations_products;
CREATE POLICY "service role manages invitations products"
  ON website_invitations_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── website_page_sections ──
DROP POLICY IF EXISTS "Service role full access on website_page_sections"
  ON website_page_sections;

DROP POLICY IF EXISTS "anyone can read page sections"
  ON website_page_sections;
CREATE POLICY "anyone can read page sections"
  ON website_page_sections
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "service role manages page sections"
  ON website_page_sections;
CREATE POLICY "service role manages page sections"
  ON website_page_sections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
