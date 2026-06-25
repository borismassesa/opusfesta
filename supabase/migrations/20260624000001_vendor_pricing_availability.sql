-- Vendor pricing + availability columns, and a service-area backfill.
--
-- (c) Three onboarding fields had no dedicated column and therefore never
-- reached the admin review page or the public vendor detail page — they lived
-- only inside `application_snapshot`:
--   * starting_price  — the vendor's "starting from" price (pricing step)
--   * custom_quotes   — whether the vendor accepts custom/negotiated quotes
--   * availability    — unavailable dates (no collection UI yet, but persisted)
--
-- (a) Backfill: onboarding submit historically wrote home_market / service_markets
-- only into the `location` JSONB, not the dedicated columns the admin + public
-- mapper read. Copy them across for vendors that predate the submit fix. Both
-- updates are fill-only (guarded on NULL / empty) so they never overwrite a
-- value an editor already set.

alter table public.vendors
  add column if not exists starting_price text,
  add column if not exists custom_quotes boolean,
  add column if not exists availability jsonb;

comment on column public.vendors.starting_price is 'Vendor "starting from" price string captured in onboarding (e.g. "500,000").';
comment on column public.vendors.custom_quotes is 'True when the vendor accepts custom/negotiated quotes beyond fixed packages.';
comment on column public.vendors.availability is 'Vendor-declared unavailable dates: [{ date, status, note? }].';

-- (a) Service-area backfill from the location JSONB.
update public.vendors
set home_market = location->>'homeMarket'
where home_market is null
  and (location->>'homeMarket') is not null
  and location->>'homeMarket' <> '';

update public.vendors
set service_markets = array(select jsonb_array_elements_text(location->'serviceMarkets'))
where (service_markets is null or array_length(service_markets, 1) is null)
  -- Guard the array functions: a legacy row that stored serviceMarkets as a
  -- non-array (object/string) would otherwise abort the whole migration.
  and jsonb_typeof(location->'serviceMarkets') = 'array'
  and jsonb_array_length(location->'serviceMarkets') > 0;
