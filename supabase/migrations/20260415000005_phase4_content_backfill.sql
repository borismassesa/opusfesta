-- ============================================================================
-- Phase 4: Backfill legacy content tables into studio_documents.
--
-- Copies existing rows from studio_projects, studio_testimonials,
-- studio_team_members, and studio_services into the polymorphic
-- studio_documents store.
--
-- Shape transformations:
--   - legacy `is_published` flag → set published_at = updated_at when true
--   - legacy `cover_image` string URLs → dropped (new schema uses asset_id
--     references into studio_assets; legacy image URLs are preserved in
--     draft_content.legacy_cover_image_url so nothing is lost, but the
--     image field stays null until manually re-uploaded).
--   - legacy stats/highlights JSONB arrays → mapped into the new array shapes.
--
-- Idempotent: uses NOT EXISTS guards keyed on slug / author / name / title
-- to avoid re-inserting documents on re-run.
--
-- Legacy tables remain untouched. The drop happens in a later migration
-- after code has been switched to read from studio_documents.
-- ============================================================================

-- ─── 1. Projects ─────────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'studio_projects'
  ) then
    insert into studio_documents (type, draft_content, published_content, published_at, created_at, updated_at)
    select
      'project'                                               as type,
      jsonb_build_object(
        'slug',             coalesce(slug, ''),
        'number',           coalesce(number, ''),
        'category',         coalesce(category, ''),
        'title',            coalesce(title, ''),
        'description',      coalesce(description, ''),
        'full_description', coalesce(full_description, ''),
        'cover_image',      null,
        'legacy_cover_image_url', cover_image,
        'video_url',        '',
        'sort_order',       coalesce(sort_order, 0),
        'stats',            coalesce(stats, '[]'::jsonb),
        'highlights',       (
          select coalesce(jsonb_agg(jsonb_build_object('text', h)), '[]'::jsonb)
          from jsonb_array_elements_text(coalesce(highlights, '[]'::jsonb)) as h
        ),
        'seo_title',        coalesce(seo_title, ''),
        'seo_description',  coalesce(seo_description, '')
      )                                                       as draft_content,
      case when is_published then
        jsonb_build_object(
          'slug',             coalesce(slug, ''),
          'number',           coalesce(number, ''),
          'category',         coalesce(category, ''),
          'title',            coalesce(title, ''),
          'description',      coalesce(description, ''),
          'full_description', coalesce(full_description, ''),
          'cover_image',      null,
          'legacy_cover_image_url', cover_image,
          'video_url',        '',
          'sort_order',       coalesce(sort_order, 0),
          'stats',            coalesce(stats, '[]'::jsonb),
          'highlights',       (
            select coalesce(jsonb_agg(jsonb_build_object('text', h)), '[]'::jsonb)
            from jsonb_array_elements_text(coalesce(highlights, '[]'::jsonb)) as h
          ),
          'seo_title',        coalesce(seo_title, ''),
          'seo_description',  coalesce(seo_description, '')
        )
      else null end                                           as published_content,
      case when is_published then updated_at else null end    as published_at,
      created_at,
      updated_at
    from studio_projects
    where not exists (
      select 1 from studio_documents d
      where d.type = 'project'
        and d.draft_content->>'slug' = studio_projects.slug
    );
  end if;
end $$;

-- ─── 2. Testimonials ─────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'studio_testimonials'
  ) then
    insert into studio_documents (type, draft_content, published_content, published_at, created_at, updated_at)
    select
      'testimonial'                                           as type,
      jsonb_build_object(
        'quote',      coalesce(quote, ''),
        'author',     coalesce(author, ''),
        'role',       coalesce(role, ''),
        'avatar',     null,
        'legacy_avatar_url', avatar_url,
        'sort_order', coalesce(sort_order, 0)
      )                                                       as draft_content,
      case when is_published then
        jsonb_build_object(
          'quote',      coalesce(quote, ''),
          'author',     coalesce(author, ''),
          'role',       coalesce(role, ''),
          'avatar',     null,
          'legacy_avatar_url', avatar_url,
          'sort_order', coalesce(sort_order, 0)
        )
      else null end                                           as published_content,
      case when is_published then updated_at else null end    as published_at,
      created_at,
      updated_at
    from studio_testimonials
    where not exists (
      select 1 from studio_documents d
      where d.type = 'testimonial'
        and d.draft_content->>'author' = studio_testimonials.author
        and d.draft_content->>'quote'  = studio_testimonials.quote
    );
  end if;
end $$;

-- ─── 3. Team members ────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'studio_team_members'
  ) then
    insert into studio_documents (type, draft_content, published_content, published_at, created_at, updated_at)
    select
      'teamMember'                                            as type,
      jsonb_build_object(
        'name',             coalesce(name, ''),
        'role',             coalesce(role, ''),
        'bio',              coalesce(bio, ''),
        'avatar',           null,
        'legacy_avatar_url', avatar_url,
        'social_twitter',   coalesce(social_links->>'twitter',   ''),
        'social_instagram', coalesce(social_links->>'instagram', ''),
        'social_linkedin',  coalesce(social_links->>'linkedin',  ''),
        'social_website',   coalesce(social_links->>'website',   ''),
        'sort_order',       coalesce(sort_order, 0)
      )                                                       as draft_content,
      case when is_published then
        jsonb_build_object(
          'name',             coalesce(name, ''),
          'role',             coalesce(role, ''),
          'bio',              coalesce(bio, ''),
          'avatar',           null,
          'legacy_avatar_url', avatar_url,
          'social_twitter',   coalesce(social_links->>'twitter',   ''),
          'social_instagram', coalesce(social_links->>'instagram', ''),
          'social_linkedin',  coalesce(social_links->>'linkedin',  ''),
          'social_website',   coalesce(social_links->>'website',   ''),
          'sort_order',       coalesce(sort_order, 0)
        )
      else null end                                           as published_content,
      case when is_published then updated_at else null end    as published_at,
      created_at,
      updated_at
    from studio_team_members
    where not exists (
      select 1 from studio_documents d
      where d.type = 'teamMember'
        and d.draft_content->>'name' = studio_team_members.name
    );
  end if;
end $$;

-- ─── 4. Services ─────────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'studio_services'
  ) then
    insert into studio_documents (type, draft_content, published_content, published_at, created_at, updated_at)
    select
      'service'                                               as type,
      jsonb_build_object(
        'title',       coalesce(title, ''),
        'description', coalesce(description, ''),
        'price',       coalesce(price, ''),
        'cover_image', null,
        'legacy_cover_image_url', cover_image,
        'includes', (
          select coalesce(jsonb_agg(jsonb_build_object('text', i)), '[]'::jsonb)
          from jsonb_array_elements_text(coalesce(includes, '[]'::jsonb)) as i
        ),
        'sort_order',  coalesce(sort_order, 0)
      )                                                       as draft_content,
      case when is_active then
        jsonb_build_object(
          'title',       coalesce(title, ''),
          'description', coalesce(description, ''),
          'price',       coalesce(price, ''),
          'cover_image', null,
          'legacy_cover_image_url', cover_image,
          'includes', (
            select coalesce(jsonb_agg(jsonb_build_object('text', i)), '[]'::jsonb)
            from jsonb_array_elements_text(coalesce(includes, '[]'::jsonb)) as i
          ),
          'sort_order',  coalesce(sort_order, 0)
        )
      else null end                                           as published_content,
      case when is_active then updated_at else null end       as published_at,
      created_at,
      updated_at
    from studio_services
    where not exists (
      select 1 from studio_documents d
      where d.type = 'service'
        and d.draft_content->>'title' = studio_services.title
    );
  end if;
end $$;
