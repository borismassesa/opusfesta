-- OpusPass check-in — record how many of a party actually arrived
--
-- guest_invitations.party_size is the headcount the guest RSVP'd for. That is
-- not always who walks through the door: a guest who RSVP'd for 2 may show up
-- alone. The door attendant confirms the real number at scan time, so the
-- couple's live headcount reflects the room rather than the RSVP form.
--
-- Kept as a separate nullable column rather than mutating party_size, because
-- the RSVP'd figure is still needed for catering/seating comparisons — the
-- interesting number is the delta between the two.

ALTER TABLE guest_invitations
  -- NULL until scanned. On check-in it defaults to the full party_size, so the
  -- common "everyone came" case needs no extra input from the attendant.
  ADD COLUMN IF NOT EXISTS checked_in_party_size INT;

-- Replace the 3-arg version from 20260630000001 with a 4-arg one.
-- DROP + CREATE rather than adding an overload: two functions differing only
-- by a defaulted trailing arg makes an existing 3-arg call ambiguous, which
-- Postgres rejects at call time. Dropping first keeps exactly one signature,
-- so apps/opus_scanner's existing 3-arg call still resolves (via the default)
-- without any change on its side.
DROP FUNCTION IF EXISTS checkin_guest_invitation(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION checkin_guest_invitation(
  p_guest_invitation_id UUID,
  p_checked_in_by TEXT,
  p_checked_in_door TEXT,
  p_checked_in_party_size INT DEFAULT NULL
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
      checked_in_door = p_checked_in_door,
      -- Callers that don't ask (the web scanner) record the whole party as
      -- arrived. Clamp to 1..party_size so a malformed client can never
      -- inflate the headcount beyond what was actually invited.
      checked_in_party_size = LEAST(
        GREATEST(COALESCE(p_checked_in_party_size, party_size, 1), 1),
        GREATEST(COALESCE(party_size, 1), 1)
      )
  WHERE id = p_guest_invitation_id
    AND checked_in_at IS NULL
  RETURNING * INTO v_row;

  RETURN v_row; -- NULL row (all fields null) if no update happened
END;
$$;
