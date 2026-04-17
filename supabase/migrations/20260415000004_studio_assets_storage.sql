-- ============================================================================
-- Phase 2: Studio Assets Storage
-- Creates the public Supabase Storage bucket used by the CMS image field.
-- RLS: public read, service_role write. Admin API routes upload via service
-- role, public pages read optimized URLs directly from the CDN.
-- ============================================================================

-- Create the bucket (idempotent)
insert into storage.buckets (id, name, public)
values ('studio-assets', 'studio-assets', true)
on conflict (id) do update set public = excluded.public;

-- Public read policy — anyone can GET objects in this bucket via the CDN
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public_read_studio_assets'
  ) then
    create policy "public_read_studio_assets" on storage.objects
      for select
      using (bucket_id = 'studio-assets');
  end if;
end $$;

-- Service-role full access — admin uploads
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'service_role_all_studio_assets'
  ) then
    create policy "service_role_all_studio_assets" on storage.objects
      for all to service_role
      using (bucket_id = 'studio-assets')
      with check (bucket_id = 'studio-assets');
  end if;
end $$;
