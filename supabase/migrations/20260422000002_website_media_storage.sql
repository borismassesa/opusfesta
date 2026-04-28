-- Website Media Storage — public bucket for opus_website CMS uploads (hero video/image, etc.)
-- Mirrors studio-assets pattern: public read, service-role write.

insert into storage.buckets (id, name, public)
values ('website-media', 'website-media', true)
on conflict (id) do update set public = excluded.public;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public_read_website_media'
  ) then
    create policy "public_read_website_media" on storage.objects
      for select
      using (bucket_id = 'website-media');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'service_role_all_website_media'
  ) then
    create policy "service_role_all_website_media" on storage.objects
      for all to service_role
      using (bucket_id = 'website-media')
      with check (bucket_id = 'website-media');
  end if;
end $$;
