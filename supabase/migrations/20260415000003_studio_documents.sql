-- ============================================================================
-- Phase 1: Studio Documents
-- Polymorphic document store — the foundation of the Sanity-equivalent CMS.
-- Every content type (faq, article, project, testimonial, etc.) is stored
-- as a row in studio_documents with a `type` discriminator. Schema validation
-- lives in the application layer via Zod (lib/cms/types/*).
-- ============================================================================

-- Shared updated_at trigger function — defined idempotently here so this
-- migration is self-sufficient.
create or replace function studio_set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. Core document store
create table if not exists studio_documents (
  id uuid primary key default gen_random_uuid(),
  type text not null,

  -- Content
  draft_content     jsonb not null default '{}'::jsonb,
  published_content jsonb,                               -- null = never published

  -- Publish state
  published_at timestamptz,
  publish_at   timestamptz,                              -- Phase 5 scheduled publishing

  -- Soft delete
  deleted_at timestamptz,

  -- Soft lock (Phase 5 collaboration)
  lock_holder       text,
  lock_acquired_at  timestamptz,

  -- Author audit
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  text
);

alter table studio_documents enable row level security;

create trigger trg_studio_documents_updated
  before update on studio_documents
  for each row execute function studio_set_updated_at();

-- Hot paths
create index idx_studio_documents_type_created
  on studio_documents(type, created_at desc)
  where deleted_at is null;

create index idx_studio_documents_type_published
  on studio_documents(type, published_at desc)
  where deleted_at is null and published_at is not null;

create index idx_studio_documents_scheduled
  on studio_documents(publish_at)
  where deleted_at is null and published_at is null and publish_at is not null;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'studio_documents'
      and policyname = 'service_role_all_studio_documents'
  ) then
    create policy "service_role_all_studio_documents" on studio_documents
      for all to service_role using (true) with check (true);
  end if;
end $$;

-- 2. Revision log (append-only)
create table if not exists studio_document_revisions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references studio_documents(id) on delete cascade,

  content jsonb not null,
  action  text not null check (action in ('save', 'publish', 'unpublish', 'restore')),
  comment text,

  created_at timestamptz not null default now(),
  created_by text
);

alter table studio_document_revisions enable row level security;

create index idx_studio_document_revisions_doc
  on studio_document_revisions(document_id, created_at desc);

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'studio_document_revisions'
      and policyname = 'service_role_all_studio_document_revisions'
  ) then
    create policy "service_role_all_studio_document_revisions" on studio_document_revisions
      for all to service_role using (true) with check (true);
  end if;
end $$;

-- 3. Asset registry (Phase 2 populates this; Phase 1 creates the shell)
create table if not exists studio_assets (
  id uuid primary key default gen_random_uuid(),

  -- Storage
  bucket text not null,
  path   text not null,
  mime   text not null,
  size_bytes bigint not null,

  -- Image metadata (null for non-images)
  width  integer,
  height integer,
  blurhash text,

  -- Focal point (0..1) — used for smart cropping
  hotspot_x numeric(4,3),
  hotspot_y numeric(4,3),

  -- Author audit
  alt_text    text,
  uploaded_by text,
  created_at  timestamptz not null default now(),

  unique (bucket, path)
);

alter table studio_assets enable row level security;

create index idx_studio_assets_created on studio_assets(created_at desc);

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'studio_assets'
      and policyname = 'service_role_all_studio_assets'
  ) then
    create policy "service_role_all_studio_assets" on studio_assets
      for all to service_role using (true) with check (true);
  end if;
end $$;

-- ============================================================================
-- 4. Pilot backfill: copy existing studio_faqs into studio_documents.
-- This is a one-way copy. The old studio_faqs table (if it exists) stays in
-- place so the public site keeps reading from it until Phase 4 cutover.
-- The new CMS admin at /studio-admin/cms/faq reads from studio_documents.
--
-- Wrapped in a DO block that checks for studio_faqs first — if the legacy
-- table isn't present, the migration still succeeds and the user starts with
-- an empty FAQ list in the new CMS.
-- ============================================================================

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'studio_faqs'
  ) then
    insert into studio_documents (type, draft_content, published_content, published_at, created_at, updated_at)
    select
      'faq'                                                   as type,
      jsonb_build_object(
        'question',   question,
        'answer',     answer,
        'sort_order', sort_order
      )                                                       as draft_content,
      case when is_published then
        jsonb_build_object(
          'question',   question,
          'answer',     answer,
          'sort_order', sort_order
        )
      else null end                                           as published_content,
      case when is_published then created_at else null end    as published_at,
      created_at,
      updated_at
    from studio_faqs
    where not exists (
      -- Idempotent: skip if a document already exists with the same question
      select 1 from studio_documents d
      where d.type = 'faq'
        and d.draft_content->>'question' = studio_faqs.question
    );
  end if;
end $$;
