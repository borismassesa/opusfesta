-- Migration: Vendor verification foundation (Option B-lite, Tanzania-calibrated)
--
-- Adds the schema needed to gate vendor activation behind:
--   1. Business documents (TIN certificate, business license / sole-proprietor declaration)
--   2. Payout method (mobile money, Lipa Namba, or Tanzanian bank — name must match TIN)
--   3. E-signed vendor agreement (versioned)
--
-- Government ID + selfie liveness are intentionally deferred (collected at first
-- payout, Airbnb-style) to keep onboarding friction low while still hitting the
-- business-legitimacy trust signals couples in Tanzania actually look for.
--
-- This migration is the foundation only — the upload UI, admin review interface,
-- and state-transition triggers ship in subsequent PRs.

-- =============================================================================
-- 1) (Moved) Enum value additions
-- =============================================================================
-- New values are added in 20260501000002_vendor_onboarding_status_values.sql
-- which must run BEFORE this file. Postgres 12+ disallows referencing a value
-- added by ALTER TYPE ADD VALUE inside the same transaction — and Supabase
-- wraps each migration in a transaction — so the additions and any code that
-- uses them must live in different migration files.
--
-- This file assumes the following enum values already exist:
--   application_in_progress, verification_pending, admin_review,
--   needs_corrections, active, suspended
-- Plus the legacy values (invited, in_progress, pending_review) which linger
-- as harmless aliases and are migrated below.

-- Migrate any rows still on legacy values to the new equivalents.
UPDATE vendors
SET onboarding_status = 'application_in_progress'::vendor_onboarding_status
WHERE onboarding_status::text IN ('invited', 'in_progress');

UPDATE vendors
SET onboarding_status = 'verification_pending'::vendor_onboarding_status
WHERE onboarding_status::text = 'pending_review';

-- Update the column default so new vendor rows start in the new initial state.
ALTER TABLE vendors
  ALTER COLUMN onboarding_status SET DEFAULT 'application_in_progress'::vendor_onboarding_status;

-- =============================================================================
-- 2) Verification document types
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_doc_type') THEN
    CREATE TYPE vendor_doc_type AS ENUM (
      'tin_certificate',                -- TRA Tax Identification Number certificate
      'business_license',               -- BRELA registration / local council license
      'sole_proprietor_declaration',    -- Lighter-weight alternative for solo creatives
      'pccb_clearance',                 -- Police clearance (officiants, child entertainers)
      'national_id_front',              -- Deferred to first payout; column ready for later
      'national_id_back',
      'selfie_liveness'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_doc_status') THEN
    CREATE TYPE vendor_doc_status AS ENUM (
      'pending_review',
      'approved',
      'rejected'
    );
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS vendor_verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  doc_type vendor_doc_type NOT NULL,

  -- Storage path inside the `vendor_verification` bucket. Vendors upload via
  -- signed URLs; admins read via service role or the explicit RLS policy below.
  storage_path TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT,
  size_bytes BIGINT,

  -- Review state
  status vendor_doc_status NOT NULL DEFAULT 'pending_review',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- A vendor may re-upload after rejection; keep history rather than overwrite,
  -- so the `latest` flag lets queries pick the current submission per doc_type.
  is_latest BOOLEAN NOT NULL DEFAULT TRUE,

  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vvd_vendor_id ON vendor_verification_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vvd_status ON vendor_verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_vvd_vendor_latest
  ON vendor_verification_documents(vendor_id, doc_type)
  WHERE is_latest;

-- =============================================================================
-- 3) Payout methods
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_payout_method_type') THEN
    CREATE TYPE vendor_payout_method_type AS ENUM (
      'mpesa',
      'airtel',
      'tigo',
      'lipa_namba',
      'bank',
      'stripe_connect'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_payout_status') THEN
    CREATE TYPE vendor_payout_status AS ENUM (
      'pending',     -- Not yet verified
      'verified',    -- Admin / system confirmed name match against TIN
      'failed'       -- Verification failed; vendor must re-enter
    );
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS vendor_payout_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  method_type vendor_payout_method_type NOT NULL,
  -- Bank name for `bank`; network (vodacom/airtel/tigo) for `lipa_namba`.
  -- NULL for direct mobile money (mpesa/airtel/tigo) where the type itself implies provider.
  provider TEXT,
  account_number TEXT NOT NULL,
  -- Must match the name on the vendor's TIN certificate. Verified manually by
  -- admin in PR 5; eventually a TRA cross-reference if a public API ships.
  account_holder_name TEXT NOT NULL,

  status vendor_payout_status NOT NULL DEFAULT 'pending',
  is_default BOOLEAN NOT NULL DEFAULT TRUE,

  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vpm_vendor_id ON vendor_payout_methods(vendor_id);
-- One default payout method per vendor at a time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_vpm_vendor_default
  ON vendor_payout_methods(vendor_id)
  WHERE is_default;

-- =============================================================================
-- 4) Vendor agreements (versioned e-sign)
-- =============================================================================
CREATE TABLE IF NOT EXISTS vendor_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Bumped whenever ToS / commission / cancellation terms change. Vendors are
  -- re-prompted on the next sign-in if their highest-version signature is
  -- below the current published version.
  agreement_version TEXT NOT NULL,
  -- SHA-256 of the exact terms text the vendor signed, so the audit trail can
  -- prove what they agreed to even if the source MDX is updated later.
  agreement_text_hash TEXT NOT NULL,

  -- Identity proof at signing time
  signed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  signed_full_name TEXT NOT NULL,        -- Typed signature
  signed_ip INET,
  signed_user_agent TEXT,

  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(vendor_id, agreement_version)
);

CREATE INDEX IF NOT EXISTS idx_va_vendor_id ON vendor_agreements(vendor_id);

-- =============================================================================
-- 5) Storage bucket for verification documents
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor_verification',
  'vendor_verification',
  FALSE,
  10 * 1024 * 1024, -- 10MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6) RLS policies
-- =============================================================================

ALTER TABLE vendor_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payout_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_agreements ENABLE ROW LEVEL SECURITY;

-- Helper: is the caller an owner / manager of a given vendor?
-- Reuses is_vendor_member() introduced in migration 056.

-- vendor_verification_documents policies ---------------------------------------
DROP POLICY IF EXISTS "Vendor team reads own verification docs"
  ON vendor_verification_documents;
CREATE POLICY "Vendor team reads own verification docs"
  ON vendor_verification_documents FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner','manager']::vendor_member_role[])
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "Vendor team uploads own verification docs"
  ON vendor_verification_documents;
CREATE POLICY "Vendor team uploads own verification docs"
  ON vendor_verification_documents FOR INSERT
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner','manager']::vendor_member_role[])
  );

DROP POLICY IF EXISTS "Vendor team updates own pending docs"
  ON vendor_verification_documents;
CREATE POLICY "Vendor team updates own pending docs"
  ON vendor_verification_documents FOR UPDATE
  USING (
    -- Vendors can only mutate their own un-reviewed uploads (e.g. flip is_latest
    -- when re-uploading after rejection). Status / reviewed_at are admin-only,
    -- enforced by the `Admins manage verification docs` policy below.
    is_vendor_member(vendor_id, ARRAY['owner','manager']::vendor_member_role[])
    AND status = 'pending_review'
  )
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner','manager']::vendor_member_role[])
    AND status = 'pending_review'
  );

DROP POLICY IF EXISTS "Admins manage verification docs"
  ON vendor_verification_documents;
CREATE POLICY "Admins manage verification docs"
  ON vendor_verification_documents FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- vendor_payout_methods policies -----------------------------------------------
DROP POLICY IF EXISTS "Vendor owner reads own payout methods"
  ON vendor_payout_methods;
CREATE POLICY "Vendor owner reads own payout methods"
  ON vendor_payout_methods FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner']::vendor_member_role[])
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "Vendor owner writes own payout methods"
  ON vendor_payout_methods;
CREATE POLICY "Vendor owner writes own payout methods"
  ON vendor_payout_methods FOR INSERT
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner']::vendor_member_role[])
  );

DROP POLICY IF EXISTS "Vendor owner updates own payout methods"
  ON vendor_payout_methods;
CREATE POLICY "Vendor owner updates own payout methods"
  ON vendor_payout_methods FOR UPDATE
  USING (
    -- Vendors can replace pending payout methods. Once verified, only admin
    -- can mutate (prevents fraud after approval).
    is_vendor_member(vendor_id, ARRAY['owner']::vendor_member_role[])
    AND status = 'pending'
  )
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner']::vendor_member_role[])
  );

DROP POLICY IF EXISTS "Admins manage payout methods"
  ON vendor_payout_methods;
CREATE POLICY "Admins manage payout methods"
  ON vendor_payout_methods FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- vendor_agreements policies ---------------------------------------------------
-- Agreements are insert-only from the vendor side; an audit record once signed
-- can never be edited or deleted, only superseded by a newer version.

DROP POLICY IF EXISTS "Vendor team reads own agreements"
  ON vendor_agreements;
CREATE POLICY "Vendor team reads own agreements"
  ON vendor_agreements FOR SELECT
  USING (
    is_vendor_member(vendor_id, ARRAY['owner','manager']::vendor_member_role[])
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "Vendor owner signs agreements"
  ON vendor_agreements;
CREATE POLICY "Vendor owner signs agreements"
  ON vendor_agreements FOR INSERT
  WITH CHECK (
    is_vendor_member(vendor_id, ARRAY['owner']::vendor_member_role[])
    AND signed_by = requesting_user_id()
  );

-- Storage bucket policies ------------------------------------------------------
-- Path convention: vendor_verification/{vendor_id}/{doc_type}/{uuid}.{ext}

DROP POLICY IF EXISTS "Vendor team reads own verification files"
  ON storage.objects;
CREATE POLICY "Vendor team reads own verification files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vendor_verification'
    AND (
      is_platform_admin()
      OR is_vendor_member(
        ((storage.foldername(name))[1])::uuid,
        ARRAY['owner','manager']::vendor_member_role[]
      )
    )
  );

DROP POLICY IF EXISTS "Vendor team uploads verification files"
  ON storage.objects;
CREATE POLICY "Vendor team uploads verification files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor_verification'
    AND is_vendor_member(
      ((storage.foldername(name))[1])::uuid,
      ARRAY['owner','manager']::vendor_member_role[]
    )
  );

DROP POLICY IF EXISTS "Vendor team replaces own pending files"
  ON storage.objects;
CREATE POLICY "Vendor team replaces own pending files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vendor_verification'
    AND is_vendor_member(
      ((storage.foldername(name))[1])::uuid,
      ARRAY['owner','manager']::vendor_member_role[]
    )
  );

DROP POLICY IF EXISTS "Admins manage verification files"
  ON storage.objects;
CREATE POLICY "Admins manage verification files"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'vendor_verification' AND is_platform_admin()
  )
  WITH CHECK (
    bucket_id = 'vendor_verification' AND is_platform_admin()
  );

-- =============================================================================
-- 7) updated_at triggers
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vvd_updated_at ON vendor_verification_documents;
CREATE TRIGGER trg_vvd_updated_at
  BEFORE UPDATE ON vendor_verification_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_vpm_updated_at ON vendor_payout_methods;
CREATE TRIGGER trg_vpm_updated_at
  BEFORE UPDATE ON vendor_payout_methods
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
