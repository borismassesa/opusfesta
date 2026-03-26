-- Create vendor-portfolios storage bucket for vendor onboarding photo uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vendor-portfolios',
  'vendor-portfolios',
  true,
  10485760, -- 10MB per file
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Vendors can upload their own portfolio photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vendor-portfolios'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

-- Allow public read access
create policy "Portfolio photos are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'vendor-portfolios');

-- Allow authenticated users to delete their own photos
create policy "Vendors can delete their own portfolio photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vendor-portfolios'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );
