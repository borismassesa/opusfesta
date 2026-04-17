-- ============================================================================
-- Phase 4: Drop legacy content tables now that data lives in studio_documents
-- and the code has been switched to read from the new location.
--
-- Tables dropped:
--   - studio_projects
--   - studio_testimonials
--   - studio_team_members
--   - studio_services
--   - studio_faqs
--
-- Tables preserved (still have their own legacy flows):
--   - studio_articles      — body_html → Tiptap JSON conversion pending (Phase 5)
--   - studio_page_sections — page section modeling pending (Phase 5)
--   - studio_seo           — key-value settings, not yet migrated
--   - studio_settings      — key-value settings, not yet migrated
--
-- Run AFTER 20260415000005_phase4_content_backfill.sql and AFTER the code
-- change that points data-access.ts at studio_documents. This migration is
-- destructive and not recoverable without a backup.
-- ============================================================================

drop table if exists studio_projects      cascade;
drop table if exists studio_testimonials  cascade;
drop table if exists studio_team_members  cascade;
drop table if exists studio_services      cascade;
drop table if exists studio_faqs          cascade;
