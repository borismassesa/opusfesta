-- Short, human-typable entry code per invitation.
--
-- The entrance-pass QR carries a signed HMAC token (~200 chars) which is
-- fine for a camera but impossible to read out or type. When a QR won't
-- scan — cracked screen, dead battery, a printed ticket in bad light — the
-- attendant currently has to search by name, which is slow at a door and
-- ambiguous when two guests share a name.
--
-- This adds a 6-character code printed alongside the QR. It identifies the
-- invitation only; it is NOT a credential. Presenting a code still goes
-- through the same server-side checks as a scan (valid door token, event
-- match, rsvp_status = 'attending'), so guessing one is no more useful than
-- guessing a guest's name off the list.

-- Same alphabet as the door access code: Crockford-style base32 without
-- I, L, O or U, so nothing is confusable with 1 or 0 when read off a ticket.
CREATE OR REPLACE FUNCTION generate_guest_entry_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  alphabet CONSTANT TEXT := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(alphabet, floor(random() * length(alphabet))::int + 1, 1);
  END LOOP;
  RETURN result;
END;
$$;

ALTER TABLE guest_invitations
  ADD COLUMN IF NOT EXISTS entry_code TEXT;

-- Unique per event, not globally: codes stay short, and every lookup is
-- already scoped to one event by the scanner's access token.
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_invitations_entry_code
  ON guest_invitations(event_id, entry_code)
  WHERE entry_code IS NOT NULL;

-- Assign on insert, retrying on the (rare) collision within an event.
CREATE OR REPLACE FUNCTION set_guest_entry_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  candidate TEXT;
  attempts INT := 0;
BEGIN
  IF NEW.entry_code IS NOT NULL THEN
    RETURN NEW;
  END IF;

  LOOP
    candidate := generate_guest_entry_code();
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM guest_invitations
      WHERE event_id = NEW.event_id AND entry_code = candidate
    );
    attempts := attempts + 1;
    -- 32^6 is ~1e9 per event, so this should never spin. Bail out rather
    -- than loop forever if something is badly wrong.
    IF attempts >= 10 THEN
      RAISE EXCEPTION 'Could not allocate a unique entry code for event %', NEW.event_id;
    END IF;
  END LOOP;

  NEW.entry_code := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guest_invitations_entry_code ON guest_invitations;
CREATE TRIGGER trg_guest_invitations_entry_code
  BEFORE INSERT ON guest_invitations
  FOR EACH ROW EXECUTE FUNCTION set_guest_entry_code();

-- Backfill existing invitations one at a time so each collision check sees
-- the rows already assigned in this same run.
DO $$
DECLARE
  row_id UUID;
  row_event UUID;
  candidate TEXT;
BEGIN
  FOR row_id, row_event IN
    SELECT id, event_id FROM guest_invitations WHERE entry_code IS NULL
  LOOP
    LOOP
      candidate := generate_guest_entry_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM guest_invitations
        WHERE event_id = row_event AND entry_code = candidate
      );
    END LOOP;
    UPDATE guest_invitations SET entry_code = candidate WHERE id = row_id;
  END LOOP;
END $$;
