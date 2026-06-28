-- Admin-requested vendor document uploads.
-- An admin asks a vendor for an arbitrary document (e.g. "2024 tax clearance").
-- The vendor receives an emailed, tokenized link and uploads on a no-login page;
-- the file attaches to the request row for the admin to review and mark complete.
-- Distinct from vendor_verification_documents (the fixed onboarding doc set).

CREATE TABLE vendor_document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- What the admin is asking for.
  title TEXT NOT NULL,
  details TEXT,

  -- Random, unguessable token used in the public upload link. Looked up by the
  -- (public, no-login) upload page via the service-role client.
  token TEXT NOT NULL UNIQUE,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'submitted', 'completed', 'cancelled')),

  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,

  -- Vendor's optional note + the uploaded file (null until submitted).
  response_note TEXT,
  storage_path TEXT,
  original_filename TEXT,
  mime_type TEXT,
  size_bytes BIGINT,

  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vdr_vendor_id ON vendor_document_requests(vendor_id);
CREATE INDEX idx_vdr_status ON vendor_document_requests(status);

CREATE TRIGGER trg_vdr_updated_at
  BEFORE UPDATE ON vendor_document_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE vendor_document_requests ENABLE ROW LEVEL SECURITY;

-- Admins manage everything. The public upload path and admin reads run through
-- the service-role client, so they bypass RLS; this policy covers any
-- Clerk-authed admin reads from the panel.
CREATE POLICY "Admins manage document requests" ON vendor_document_requests
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Vendor team can read their own requests (so they can optionally surface in the
-- portal). They never write directly; uploads go through the tokenized route.
CREATE POLICY "Vendor team reads own document requests" ON vendor_document_requests
  FOR SELECT
  USING (is_vendor_member(vendor_id));
