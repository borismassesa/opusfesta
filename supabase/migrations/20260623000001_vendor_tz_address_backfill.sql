-- Migrate vendor addresses to the Tanzania administrative model
-- (Region › District › Ward › Street/Village, plus House/Plot, Landmark, P.O. Box).
--
-- vendors.location and vendors.application_snapshot are JSONB. New onboarding
-- submissions and admin/storefront edits now write `houseNumber`, `street`,
-- `ward`, `district`, `region`, `landmark`, `postalCode`. This backfills the new
-- keys for EXISTING rows from the legacy keys so the admin + storefront editors
-- render them for already-submitted vendors:
--     district    <- city      (the old locality field)
--     houseNumber <- street2    (the old "apartment / suite / plot" field)
--
-- `city` is intentionally LEFT IN PLACE (it mirrors District) because the public
-- marketplace (vendor cards, map, search, schema.org) still reads location.city
-- as the locality label. `street`, `region`, and `postalCode` keep their meaning.
--
-- Additive and idempotent: only fills a new key when it is currently empty.

update public.vendors
set location = location || jsonb_strip_nulls(jsonb_build_object(
    'district',    coalesce(nullif(location->>'district', ''),    nullif(location->>'city', '')),
    'houseNumber', coalesce(nullif(location->>'houseNumber', ''), nullif(location->>'street2', ''))
  ))
where location is not null
  and jsonb_typeof(location) = 'object'
  and (
    (coalesce(location->>'district', '')    = '' and coalesce(location->>'city', '')    <> '')
    or (coalesce(location->>'houseNumber', '') = '' and coalesce(location->>'street2', '') <> '')
  );

update public.vendors
set application_snapshot = application_snapshot || jsonb_strip_nulls(jsonb_build_object(
    'district',    coalesce(nullif(application_snapshot->>'district', ''),    nullif(application_snapshot->>'city', '')),
    'houseNumber', coalesce(nullif(application_snapshot->>'houseNumber', ''), nullif(application_snapshot->>'street2', ''))
  ))
where application_snapshot is not null
  and jsonb_typeof(application_snapshot) = 'object'
  and (
    (coalesce(application_snapshot->>'district', '')    = '' and coalesce(application_snapshot->>'city', '')    <> '')
    or (coalesce(application_snapshot->>'houseNumber', '') = '' and coalesce(application_snapshot->>'street2', '') <> '')
  );
