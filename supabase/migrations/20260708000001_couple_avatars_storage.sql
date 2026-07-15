-- Create couple-avatars storage bucket for the Home screen couple photo upload
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'couple-avatars',
  'couple-avatars',
  true,
  10485760, -- 10MB per file
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Couples can upload their own avatar photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'couple-avatars'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

-- Allow public read access
create policy "Couple avatar photos are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'couple-avatars');

-- Allow authenticated users to delete/replace their own avatar
create policy "Couples can delete their own avatar photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'couple-avatars'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );
