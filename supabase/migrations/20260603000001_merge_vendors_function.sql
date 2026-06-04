-- Merge two duplicate vendor records into one.
--
-- Reassigns every child row from the losing vendor to the surviving vendor,
-- then leaves the (now child-less) loser row for the application to delete —
-- the app also removes the loser's Clerk login, which Postgres can't do.
--
-- Why an atomic function: thirteen child tables FK-reference vendors(id) with
-- ON DELETE CASCADE, so deleting the loser without first moving its rows would
-- destroy financial history (invoices/payments/payouts), bookings inquiries,
-- reviews, documents, etc. Doing the reassignment row-by-row from the app is
-- non-atomic; a mid-way failure would split a vendor's data across two ids.
-- Here it's one transaction: all-or-nothing.
--
-- Four child tables carry a vendor_id-bearing UNIQUE constraint
-- (reviews/saved_vendors on (user_id, vendor_id), vendor_memberships on
-- (vendor_id, user_id), vendor_agreements on (vendor_id, agreement_version)).
-- For those we DELETE the loser rows that would collide with an existing
-- survivor row first, then reassign the rest — otherwise the UPDATE would trip
-- the unique index. The remaining nine tables have no such collision risk and
-- reassign directly.

create or replace function public.merge_vendors(p_loser uuid, p_survivor uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_loser is null or p_survivor is null then
    raise exception 'merge_vendors: loser and survivor are required';
  end if;
  if p_loser = p_survivor then
    raise exception 'merge_vendors: loser and survivor must differ';
  end if;
  if not exists (select 1 from vendors where id = p_loser) then
    raise exception 'merge_vendors: loser % not found', p_loser;
  end if;
  if not exists (select 1 from vendors where id = p_survivor) then
    raise exception 'merge_vendors: survivor % not found', p_survivor;
  end if;

  -- Straight reassign — no vendor_id-bearing unique constraint to collide with.
  update inquiries                     set vendor_id = p_survivor where vendor_id = p_loser;
  update invoices                      set vendor_id = p_survivor where vendor_id = p_loser;
  update payments                      set vendor_id = p_survivor where vendor_id = p_loser;
  update payouts                       set vendor_id = p_survivor where vendor_id = p_loser;
  update portfolio                     set vendor_id = p_survivor where vendor_id = p_loser;
  update vendor_payout_methods         set vendor_id = p_survivor where vendor_id = p_loser;
  update vendor_reviews                set vendor_id = p_survivor where vendor_id = p_loser;
  update vendor_verification_documents set vendor_id = p_survivor where vendor_id = p_loser;
  update vendor_views                  set vendor_id = p_survivor where vendor_id = p_loser;

  -- Dedupe-then-reassign for the unique-constrained tables.
  delete from reviews r
   where r.vendor_id = p_loser
     and exists (select 1 from reviews s where s.vendor_id = p_survivor and s.user_id = r.user_id);
  update reviews set vendor_id = p_survivor where vendor_id = p_loser;

  delete from saved_vendors r
   where r.vendor_id = p_loser
     and exists (select 1 from saved_vendors s where s.vendor_id = p_survivor and s.user_id = r.user_id);
  update saved_vendors set vendor_id = p_survivor where vendor_id = p_loser;

  delete from vendor_memberships r
   where r.vendor_id = p_loser
     and exists (select 1 from vendor_memberships s where s.vendor_id = p_survivor and s.user_id = r.user_id);
  update vendor_memberships set vendor_id = p_survivor where vendor_id = p_loser;

  delete from vendor_agreements r
   where r.vendor_id = p_loser
     and exists (select 1 from vendor_agreements s where s.vendor_id = p_survivor and s.agreement_version = r.agreement_version);
  update vendor_agreements set vendor_id = p_survivor where vendor_id = p_loser;
end;
$$;

comment on function public.merge_vendors(uuid, uuid) is
  'Reassigns all child rows from a losing vendor to a surviving vendor in one transaction, deduping unique-constrained tables. The app deletes the loser row + Clerk login afterwards.';

-- Admin operations run through the service-role key (createSupabaseAdminClient),
-- which bypasses RLS; revoke from anon/authenticated so it is never callable
-- from the public PostgREST surface.
revoke all on function public.merge_vendors(uuid, uuid) from public, anon, authenticated;
