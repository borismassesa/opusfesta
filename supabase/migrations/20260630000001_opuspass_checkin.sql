-- OpusPass door-staff check-in scanner — Sprint 1 (schema + tokens)
--
-- Sub-events (ceremony/reception/send-off/...) are already separate rows in
-- wedding_events, and guest_invitations is uniquely keyed per (guest, event).
-- So check-in is a plain column-add on guest_invitations — no new join table.
--
-- Door staff are rotating/temp and do NOT get Clerk accounts. Instead the
-- couple/admin issues a short-lived, event-scoped access token from the
-- OpusPass dashboard; the scanner PWA holds that token and calls a
-- service-role-only RPC to check guests in. Nothing here is reachable via
-- anon/authenticated RLS — all scanner writes go through
-- checkin_guest_invitation(), called with the service-role client after the
-- API route verifies the bearer token against scanner_access_tokens.

-- 1) Check-in fields on the existing per-event RSVP row
ALTER TABLE guest_invitations
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_in_by TEXT,   -- staff/device label, e.g. "Gate 2 - Asha"
  ADD COLUMN IF NOT EXISTS checked_in_door TEXT; -- door/sub-event label the scan happened at

CREATE INDEX IF NOT EXISTS idx_guest_invitations_checked_in_at
  ON guest_invitations(checked_in_at) WHERE checked_in_at IS NOT NULL;

-- 2) Event-scoped access tokens for door-staff devices
CREATE TABLE IF NOT EXISTS scanner_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- couple/admin who issued it
  event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,

  door_label TEXT NOT NULL DEFAULT 'Main Gate',
  token_hash TEXT NOT NULL UNIQUE, -- sha256 of the token; raw token is shown once, never stored

  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scanner_access_tokens_event_id ON scanner_access_tokens(event_id);
CREATE INDEX IF NOT EXISTS idx_scanner_access_tokens_user_id ON scanner_access_tokens(user_id);

ALTER TABLE scanner_access_tokens ENABLE ROW LEVEL SECURITY;

-- Owners can list/revoke tokens they issued from the OpusPass dashboard.
-- Token *verification* by the scanner app never goes through this policy —
-- it uses the service-role client (see apps/opus_scanner API routes).
CREATE POLICY scanner_access_tokens_owner ON scanner_access_tokens
  FOR ALL USING (requesting_user_id() = user_id)
  WITH CHECK (requesting_user_id() = user_id);

-- 3) Atomic first-scan-wins check-in.
-- Returns the updated row, or NULL if already checked in (caller reports "duplicate").
-- SECURITY DEFINER so it can be called with the service-role/authenticated
-- client without needing owner-level RLS access to guest_invitations.
CREATE OR REPLACE FUNCTION checkin_guest_invitation(
  p_guest_invitation_id UUID,
  p_checked_in_by TEXT,
  p_checked_in_door TEXT
) RETURNS guest_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row guest_invitations;
BEGIN
  UPDATE guest_invitations
  SET checked_in_at = now(),
      checked_in_by = p_checked_in_by,
      checked_in_door = p_checked_in_door
  WHERE id = p_guest_invitation_id
    AND checked_in_at IS NULL
  RETURNING * INTO v_row;

  RETURN v_row; -- NULL row (all fields null) if no update happened
END;
$$;
