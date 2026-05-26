-- Approvals module — persistent store for staff approval requests (business
-- trips, payments, procurement, RFQs, contracts, etc.). Backs:
--   /approvals  — create a request, route it to approver(s), and track the
--                 To Submit → Submitted → Approved/Refused lifecycle.
--
-- Previously the module ran entirely off in-memory seed data, so requests
-- vanished on reload. This migration gives it real persistence.
--
-- Two tables:
--   approval_requests          — one row per request (owner, fields, approvers, status)
--   approval_request_activity  — append-only feed of system events + notes per request
--
-- The admin app writes via the service role key (bypasses RLS) and enforces
-- "you must have approvals access" inside the server actions (finance.read OR
-- workforce.read, mirroring the /approvals layout gate). The RLS policies
-- below are belt-and-braces for any future direct-JWT access.

-- ---------------------------------------------------------------------------
-- approval_requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- One of the nine catalog categories declared in the Approvals module's
  -- data.ts. Kept as a CHECK rather than an enum so adding a category is a
  -- code change, not a migration.
  category text NOT NULL CHECK (category IN (
    'business-trip', 'borrow-items', 'general-approval', 'contract-approval',
    'payment-application', 'car-rental', 'job-referral-award', 'procurement', 'rfq'
  )),
  subject text NOT NULL CHECK (length(btrim(subject)) > 0),
  -- Who raised the request. Owner identity is set server-side from the
  -- Clerk session, never trusted from the client.
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  owner_initials text NOT NULL,
  owner_clerk_id text,
  -- Category-specific form values, keyed by field id (see ApprovalField).
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Chosen approvers: array of { id, name, role, email }.
  approvers jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'To Submit'
    CHECK (status IN ('To Submit', 'Submitted', 'Approved', 'Refused')),
  -- Stamped the first time the request transitions to Submitted.
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Dashboard lists newest-touched first; category views filter by category.
CREATE INDEX IF NOT EXISTS idx_approval_requests_updated_at
  ON approval_requests (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_requests_category_updated
  ON approval_requests (category, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_requests_owner_email
  ON approval_requests (lower(owner_email));

DROP TRIGGER IF EXISTS trg_approval_requests_updated_at ON approval_requests;
CREATE TRIGGER trg_approval_requests_updated_at
  BEFORE UPDATE ON approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- approval_request_activity
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_request_activity (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  -- 'system' for lifecycle events, 'note' for human-authored notes,
  -- 'message' reserved for future inbound/outbound message logging.
  kind text NOT NULL CHECK (kind IN ('system', 'note', 'message')),
  author text NOT NULL,
  author_initials text NOT NULL,
  author_color text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_request_activity_request
  ON approval_request_activity (request_id, created_at);

-- ---------------------------------------------------------------------------
-- RLS — admin-only; real gating lives in the server actions.
-- ---------------------------------------------------------------------------
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_request_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "approval_requests_read" ON approval_requests;
CREATE POLICY "approval_requests_read" ON approval_requests
  FOR SELECT TO authenticated
  USING (is_workforce_reader());

DROP POLICY IF EXISTS "approval_requests_write" ON approval_requests;
CREATE POLICY "approval_requests_write" ON approval_requests
  FOR ALL TO authenticated
  USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());

DROP POLICY IF EXISTS "approval_request_activity_read" ON approval_request_activity;
CREATE POLICY "approval_request_activity_read" ON approval_request_activity
  FOR SELECT TO authenticated
  USING (is_workforce_reader());

DROP POLICY IF EXISTS "approval_request_activity_write" ON approval_request_activity;
CREATE POLICY "approval_request_activity_write" ON approval_request_activity
  FOR ALL TO authenticated
  USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());

COMMENT ON TABLE approval_requests IS
  'Approvals module — staff approval requests (trips, payments, procurement, etc.). RLS: workforce reader/admin; real access gating (finance.read OR workforce.read) enforced in server actions.';
COMMENT ON TABLE approval_request_activity IS
  'Approvals module — append-only activity feed (system events + notes) per approval request.';

NOTIFY pgrst, 'reload schema';
