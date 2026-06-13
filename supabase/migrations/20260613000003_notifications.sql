-- In-app notifications for the signed-in couple (OpusPass navbar bell).
--
-- Rows are written server-side by service-role server actions in the same flow
-- as the underlying event (a guest RSVP, a pledge, later a confirmed payment),
-- and read back by the owning couple. user_id is the canonical public.users.id
-- resolved from the Clerk session.
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users (id) on delete cascade,
  -- Kept in sync with NotificationType in opus_pass lib/dashboard/notifications.ts.
  type       text not null check (type in (
               'rsvp_received', 'pledge_received', 'payment_confirmed', 'system'
             )),
  title      text not null,
  body       text,
  -- Optional in-app deep link (e.g. /my/dashboard/rsvps).
  href       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- Newest-first listing per couple, and a partial index for the unread badge count.
create index if not exists notifications_user_created_idx
  on notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on notifications (user_id) where read = false;

-- Owner-only access (defense-in-depth; server actions use the service-role client
-- and additionally scope every query by user_id). Inserts are service-role only.
alter table notifications enable row level security;

drop policy if exists notifications_select_own on notifications;
create policy notifications_select_own on notifications
  for select using (requesting_user_id() = user_id);

drop policy if exists notifications_update_own on notifications;
create policy notifications_update_own on notifications
  for update using (requesting_user_id() = user_id)
  with check (requesting_user_id() = user_id);

notify pgrst, 'reload schema';
