-- ============================================================================
-- Migration: Slot Hold Auto-Expiry Function
-- PL/pgSQL function to expire stale slot holds, quotes, and contracts.
-- Callable via pg_cron or Supabase Edge Function cron.
-- ============================================================================

-- Expire slot holds past their expiry time
create or replace function expire_studio_slot_holds()
returns integer as $$
declare
  expired_count integer;
begin
  update studio_slot_holds
  set is_active = false, released_at = now()
  where is_active = true and expires_at < now();
  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$ language plpgsql;

-- Expire quotes past their valid_until time (marks as expired, does not auto-cancel booking)
create or replace function expire_studio_quotes()
returns integer as $$
declare
  expired_count integer;
begin
  update studio_quotes
  set expired_at = now()
  where expired_at is null
    and accepted_at is null
    and rejected_at is null
    and valid_until < now();
  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$ language plpgsql;

-- Find contracts past their sign deadline (returns IDs for application-level handling)
create or replace function find_expired_studio_contracts()
returns table(contract_id uuid, booking_id uuid) as $$
begin
  return query
    select c.id as contract_id, c.booking_id
    from studio_contracts c
    where c.signed_at is null
      and c.voided_at is null
      and c.sign_deadline is not null
      and c.sign_deadline < now();
end;
$$ language plpgsql;
