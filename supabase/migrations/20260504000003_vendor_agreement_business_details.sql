-- Mkataba page 3 — business identification snapshot at signing time.
--
-- The PDF the vendor signs (OpusFesta Mkataba wa Watoa Huduma, OF-LGL-AGR-002)
-- has a fillable block on page 3 listing the vendor's identifying details:
-- business name, TIN, address, contact person, email, phone/WhatsApp, and
-- service type. We capture exactly what the vendor entered into that block at
-- signing time as a JSONB blob alongside the existing audit fields, so the
-- legal record reflects the document's declared contents — independent of any
-- later edits to the vendors row.
--
-- Stored shape:
--   {
--     "businessName": string,
--     "tin": string,
--     "businessAddress": string,
--     "contactPerson": string,
--     "email": string,
--     "phone": string,        -- WhatsApp / Simu
--     "serviceType": string   -- Aina ya Huduma
--   }
--
-- Nullable to remain backwards-compatible with rows signed before this
-- migration (the verification gate already passed for those vendors).

ALTER TABLE vendor_agreements
  ADD COLUMN IF NOT EXISTS signed_business_details JSONB;

COMMENT ON COLUMN vendor_agreements.signed_business_details IS
  'Snapshot of the page-3 business identification block the vendor filled in at signing time. Keys: businessName, tin, businessAddress, contactPerson, email, phone, serviceType.';
