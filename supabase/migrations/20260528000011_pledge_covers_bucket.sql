-- Public storage bucket for couple-uploaded pledge-page cover photos. Reads are
-- public (the cover shows on the unauthenticated /pledge/<token> page); writes
-- happen server-side via the service-role client in uploadPledgeCover(), so no
-- per-user RLS insert policy is required here. Capped at 5MB, images only.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pledge-covers',
  'pledge-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;
