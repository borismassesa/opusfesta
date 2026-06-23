-- ============================================================================
-- DRAFT CLEANUP — DO NOT RUN WITHOUT EXPLICIT REVIEW + APPROVAL.
-- This file lives OUTSIDE supabase/migrations/ on purpose so it never runs as
-- part of a migration apply. Run it by hand only, after confirming each row.
-- ============================================================================
--
-- Context: the verification-capture resolver bug (resolveOwnVendorId, fixed in
-- apps/vendors_portal/src/app/verify/actions.ts on branch
-- fix/vendor-onboarding-kyc-storefront) wrote multiple applicants' National ID
-- front/back + liveness selfies onto the OLDEST active vendor, "Aman foods"
-- (id e637019c-1ba1-44d9-977e-21d9e70a4069), instead of each applicant's own
-- record. Aman foods' only legitimate KYC is its 2026-06-04 onboarding batch;
-- the 12 documents below (uploaded 06-17, 06-18, and two 06-22 batches) belong
-- to OTHER applicants and must be removed from Aman foods.
--
-- IMPORTANT: we do NOT know which real applicants these 12 belong to (the
-- resolver discarded that link). Treat the images as orphaned PII to be
-- destroyed, not re-homed. The affected applicants must re-capture their IDs
-- (the resolver fix makes re-capture land on the correct vendor).
--
-- Two things must be deleted: (1) the DB rows in vendor_verification_documents,
-- and (2) the underlying objects in the private `vendor_verification` storage
-- bucket. Deleting only the DB rows leaves the ID images sitting in storage.

-- ---------------------------------------------------------------------------
-- STEP 0 — PREVIEW. Run this first and eyeball all 12 rows before deleting.
-- Expect exactly 12 rows, all with uploaded_at <> 2026-06-04.
-- ---------------------------------------------------------------------------
SELECT id, doc_type, status, is_latest, uploaded_at, storage_path
FROM vendor_verification_documents
WHERE id IN (
  '3a66d950-01af-45e8-b80e-155e15e9c13a', -- national_id_front 2026-06-17
  'a5f6148d-abe9-484d-affd-c4f9b0eb3e80', -- national_id_back  2026-06-17
  '83221c52-faf3-46bd-af39-c80652153fe1', -- selfie_liveness   2026-06-17
  '91ca3d0a-fd93-42da-8071-c564b07cc0f3', -- national_id_front 2026-06-18
  '169916dc-b48d-4f40-8180-1d5562193557', -- selfie_liveness   2026-06-18
  '9e08dc78-91b9-49b6-b01b-e4797d57bfe9', -- national_id_front 2026-06-22 08:23 (RugeCatering)
  'ed061252-d7af-45a4-985c-db8daba96ade', -- national_id_back  2026-06-22 08:24 (RugeCatering)
  '5aee9932-63a1-400c-945b-bebe919d9021', -- selfie_liveness   2026-06-22 08:25 (RugeCatering)
  'b1219bf9-5e76-44a4-8aaa-472864a41005', -- national_id_front 2026-06-22 09:53 (RugeCatering)
  'e05ecdb0-cfc9-4c90-811f-9dfe7951c96f', -- national_id_back  2026-06-22 09:53 (RugeCatering)
  'c58d3428-bcb3-4925-aaa8-5d8964dfafd5', -- selfie_liveness   2026-06-22 09:53 (RugeCatering)
  'ea995ca4-e6ee-4baf-bf17-2a2d128d5a5b'  -- selfie_liveness   2026-06-22 09:54 (RugeCatering)
);

-- ---------------------------------------------------------------------------
-- STEP 1 — delete the storage objects (the actual ID/selfie images) from the
-- private `vendor_verification` bucket.
--
-- ⚠️ PII WARNING: deleting rows from storage.objects removes the metadata, but
-- it does NOT reliably purge the underlying blob from the storage backend, and
-- any signed URL minted before deletion may still resolve until it expires.
-- These are real people's National IDs and selfies. To actually destroy the
-- files you MUST also call the Storage API:
--     supabase.storage.from('vendor_verification').remove([... the 12 paths ...])
-- Run that and confirm it returns success for all 12 paths; treat THAT as the
-- authoritative deletion. The SQL below only keeps the metadata table in sync.
-- ---------------------------------------------------------------------------

BEGIN;

DELETE FROM storage.objects
WHERE bucket_id = 'vendor_verification'
  AND name IN (
    'e637019c-1ba1-44d9-977e-21d9e70a4069/national_id_front/3e1d31c7-9f98-4233-b436-a8a57cdef981.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/national_id_back/999a5443-417f-45d5-8561-a346ffa433bc.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/selfie_liveness/d5a94dca-2746-4e1a-8abe-3fcb9812e88f.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/national_id_front/4e95b6d2-34a3-4695-95fa-191656d3c0ce.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/selfie_liveness/2ab36c6c-4ae8-463f-a821-a3285ccb2ea9.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/national_id_front/cc451459-1eca-4bd7-9a44-6c3b3bd13277.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/national_id_back/9d87b93f-747a-4081-984d-86e63fb7b2a7.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/selfie_liveness/2a358901-9dda-4641-a76b-afee0fc586b2.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/national_id_front/54dd46b2-8cbf-4789-a155-f3835dbd9ae8.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/national_id_back/d386eed1-492f-4aac-90e3-ef000fe7d90c.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/selfie_liveness/4e858b59-7082-4787-aacb-5ee318e11885.jpg',
    'e637019c-1ba1-44d9-977e-21d9e70a4069/selfie_liveness/3d575a2b-7728-4d48-bd94-e31f8e57f1f7.jpg'
  );

-- STEP 2 — delete the 12 misattributed metadata rows. The vendor_id predicate
-- is a safety guard: if any id below is mistyped and happens to match a row on
-- a DIFFERENT vendor, this clause makes the delete a no-op for that row instead
-- of destroying another vendor's legitimate KYC.
DELETE FROM vendor_verification_documents
WHERE vendor_id = 'e637019c-1ba1-44d9-977e-21d9e70a4069'
  AND id IN (
  '3a66d950-01af-45e8-b80e-155e15e9c13a',
  'a5f6148d-abe9-484d-affd-c4f9b0eb3e80',
  '83221c52-faf3-46bd-af39-c80652153fe1',
  '91ca3d0a-fd93-42da-8071-c564b07cc0f3',
  '169916dc-b48d-4f40-8180-1d5562193557',
  '9e08dc78-91b9-49b6-b01b-e4797d57bfe9',
  'ed061252-d7af-45a4-985c-db8daba96ade',
  '5aee9932-63a1-400c-945b-bebe919d9021',
  'b1219bf9-5e76-44a4-8aaa-472864a41005',
  'e05ecdb0-cfc9-4c90-811f-9dfe7951c96f',
  'c58d3428-bcb3-4925-aaa8-5d8964dfafd5',
  'ea995ca4-e6ee-4baf-bf17-2a2d128d5a5b'
);

-- STEP 3 — verify Aman foods is left with ONLY its 2026-06-04 batch (5 rows),
-- then COMMIT. If the count is anything other than 5, ROLLBACK and investigate.
SELECT count(*) AS remaining_should_be_5
FROM vendor_verification_documents
WHERE vendor_id = 'e637019c-1ba1-44d9-977e-21d9e70a4069';

-- COMMIT;   -- uncomment to apply once the count above reads 5
-- ROLLBACK; -- otherwise
