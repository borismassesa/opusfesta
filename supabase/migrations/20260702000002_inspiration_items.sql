create table if not exists inspiration_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  vendor_id   uuid references vendors (id) on delete cascade,
  image_url   text not null,
  category    text,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists inspiration_items_user_id_idx on inspiration_items (user_id);
create index if not exists inspiration_items_vendor_id_idx on inspiration_items (vendor_id);

alter table inspiration_items enable row level security;

drop policy if exists inspiration_items_owner on inspiration_items;
create policy inspiration_items_owner on inspiration_items
  for all using (requesting_user_id() = user_id)
  with check (requesting_user_id() = user_id);

notify pgrst, 'reload schema';
