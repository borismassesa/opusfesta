create table if not exists push_device_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  token       text not null,
  platform    text not null check (platform in ('ios', 'android')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, token)
);

create index if not exists push_device_tokens_user_id_idx on push_device_tokens (user_id);

alter table push_device_tokens enable row level security;

drop policy if exists push_device_tokens_owner on push_device_tokens;
create policy push_device_tokens_owner on push_device_tokens
  for all using (requesting_user_id() = user_id)
  with check (requesting_user_id() = user_id);

create or replace function set_updated_at_timestamp()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists trg_push_device_tokens_updated_at on push_device_tokens;
create trigger trg_push_device_tokens_updated_at
  before update on push_device_tokens for each row
  execute function set_updated_at_timestamp();

notify pgrst, 'reload schema';
