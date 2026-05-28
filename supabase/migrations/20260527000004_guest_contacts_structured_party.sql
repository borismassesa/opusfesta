-- Structured guest party: split full_name into title/first/last/suffix,
-- carry a named plus-one + a list of children, and capture a real mailing
-- address. Matches the Zola "Edit guests" model so the UI can collect rich
-- detail while keeping full_name as the canonical display field.
--
-- Everything is additive; full_name stays NOT NULL and is kept in sync by
-- the application layer (createGuest / updateGuest in lib/dashboard/actions).

ALTER TABLE guest_contacts
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS suffix TEXT,

  ADD COLUMN IF NOT EXISTS plus_one_title TEXT,
  ADD COLUMN IF NOT EXISTS plus_one_first_name TEXT,
  ADD COLUMN IF NOT EXISTS plus_one_last_name TEXT,
  ADD COLUMN IF NOT EXISTS plus_one_suffix TEXT,
  ADD COLUMN IF NOT EXISTS plus_one_name_unknown BOOLEAN NOT NULL DEFAULT false,

  ADD COLUMN IF NOT EXISTS children JSONB NOT NULL DEFAULT '[]'::jsonb,

  ADD COLUMN IF NOT EXISTS name_on_envelope TEXT,
  ADD COLUMN IF NOT EXISTS address_country TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_apt TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_region TEXT,
  ADD COLUMN IF NOT EXISTS address_postal_code TEXT;

-- Backfill first/last from full_name on existing rows (split on first space).
UPDATE guest_contacts
   SET first_name = COALESCE(first_name, split_part(full_name, ' ', 1)),
       last_name  = COALESCE(
         last_name,
         CASE
           WHEN position(' ' in full_name) > 0
             THEN substr(full_name, position(' ' in full_name) + 1)
           ELSE NULL
         END
       )
 WHERE first_name IS NULL OR last_name IS NULL;
