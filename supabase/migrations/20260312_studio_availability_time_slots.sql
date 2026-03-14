-- Add time-specific availability slots for Studio admin.
-- Existing date-only entries are treated as "all-day" slots.

alter table if exists studio_availability
  add column if not exists time_slot text not null default 'all-day';

alter table if exists studio_availability
  drop constraint if exists studio_availability_date_key;

create unique index if not exists idx_studio_availability_date_time_slot_unique
  on studio_availability(date, time_slot);
