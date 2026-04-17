-- ============================================================================
-- Phase 5: Backfill studio_articles into studio_documents (type='article').
--
-- Preserves the legacy body_html as-is under draft_content.body_html so
-- nothing is lost. The new body field (Tiptap richtext JSON) stays empty
-- until editors manually migrate content via the rich-text editor.
--
-- Public rendering: ArticleRenderer prefers `body` when it contains a non-
-- empty Tiptap document; otherwise it falls back to body_html via the
-- allowlist-based LegacyHtmlRenderer.
--
-- Idempotent: matches on slug so re-running the migration is a no-op.
-- ============================================================================

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'studio_articles'
  ) then
    insert into studio_documents (type, draft_content, published_content, published_at, created_at, updated_at)
    select
      'article'                                               as type,
      jsonb_build_object(
        'title',           coalesce(title, ''),
        'slug',            coalesce(slug, ''),
        'excerpt',         coalesce(excerpt, ''),
        'category',        coalesce(category, ''),
        'author',          coalesce(author, ''),
        'published_at',    coalesce(to_char(published_at, 'YYYY-MM-DD'), ''),
        'body',            jsonb_build_object('type', 'doc', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph'))),
        'cover_image',     null,
        'legacy_cover_image_url', cover_image,
        'callouts',        '[]'::jsonb,
        'body_html',       coalesce(body_html, '')
      )                                                       as draft_content,
      case when is_published then
        jsonb_build_object(
          'title',           coalesce(title, ''),
          'slug',            coalesce(slug, ''),
          'excerpt',         coalesce(excerpt, ''),
          'category',        coalesce(category, ''),
          'author',          coalesce(author, ''),
          'published_at',    coalesce(to_char(published_at, 'YYYY-MM-DD'), ''),
          'body',            jsonb_build_object('type', 'doc', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph'))),
          'cover_image',     null,
          'legacy_cover_image_url', cover_image,
          'callouts',        '[]'::jsonb,
          'body_html',       coalesce(body_html, '')
        )
      else null end                                           as published_content,
      case when is_published then coalesce(published_at, updated_at) else null end as published_at,
      created_at,
      updated_at
    from studio_articles
    where not exists (
      select 1 from studio_documents d
      where d.type = 'article'
        and d.draft_content->>'slug' = studio_articles.slug
    );
  end if;
end $$;
