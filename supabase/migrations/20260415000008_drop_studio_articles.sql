-- ============================================================================
-- Phase 5: Drop studio_articles now that data lives in studio_documents
-- and lib/data-access.ts reads articles from the new location.
--
-- Preserves body_html inside draft_content so the LegacyHtmlRenderer
-- fallback keeps working for articles that haven't been manually migrated
-- into the Tiptap richtext editor yet.
--
-- Run AFTER 20260415000007_phase5_articles_backfill.sql and AFTER deploying
-- the code change. Destructive and not easily recoverable — back up
-- studio_articles first if you want a safety net.
-- ============================================================================

drop table if exists studio_articles cascade;
