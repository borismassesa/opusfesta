-- OpusPass door-staff check-in scanner — admin-assigned attendants
--
-- Extends scanner_access_tokens (added in 20260630000001) so an OpusFesta
-- admin can assign a named attendant to an event's door, alongside the
-- existing couple self-serve flow (DoorStaffAccessCard). Admin-issued rows
-- keep the same owner-only RLS policy as couple-issued ones: user_id is set
-- to the event's OWNING couple, not a separate admin identity, so the
-- couple can still see/revoke admin-assigned attendants from their own
-- dashboard alongside their own. attendant_name/assigned_by just record who
-- actually set the name and lets the UI skip the "who's scanning?" step.

ALTER TABLE scanner_access_tokens
  -- NULL = couple self-serve token; attendant types their own name client-side (unchanged behavior).
  -- Non-null = admin assigned this name at issuance; it is authoritative and the
  -- scanner must not let the device holder claim a different identity.
  ADD COLUMN IF NOT EXISTS attendant_name TEXT,
  ADD COLUMN IF NOT EXISTS assigned_by TEXT NOT NULL DEFAULT 'couple'
    CHECK (assigned_by IN ('couple', 'admin'));
