-- Chat attachments for vendor inquiries.
--
-- Couples (and vendors) can attach images and files in the inquiry conversation
-- (opus_pass dashboard inbox + vendors portal Leads). Each message can carry an
-- array of attachment descriptors:
--   [{ "url": "...", "name": "menu.pdf", "type": "application/pdf", "size": 12345 }]
--
-- Files are uploaded to the public `inquiry-attachments` storage bucket via the
-- service-role server API; public read lets the chat render them by URL.

alter table public.inquiry_messages
  add column if not exists attachments jsonb;

insert into storage.buckets (id, name, public)
values ('inquiry-attachments', 'inquiry-attachments', true)
on conflict (id) do nothing;
