-- OpusPass roster unification: ONE guest list across Guests / Send Invites /
-- RSVPs / Pledges.
--
-- Two data defects made the surfaces disagree:
--   1. Guests created by quick-add / imports had no guest_invitations rows, so
--      RSVP surfaces (and webhook button taps) could not see or update them.
--   2. The same person could exist twice (same phone) after being added from
--      two flows.
-- Product rule going forward (also enforced in app code): every guest is
-- linked to every one of the couple's events; a phone number appears once per
-- couple.

-- ── 1) Merge duplicate contacts: same owner + same phone digits ─────────────
-- Keeper = the row that was actually invited (last_invited_at set), else the
-- oldest. Losers' history moves to the keeper, answered RSVPs win over
-- pending ones, then the losers are deleted.

CREATE TEMP TABLE _gc_losers AS
WITH norm AS (
  SELECT id, user_id, created_at, last_invited_at,
         regexp_replace(coalesce(nullif(whatsapp_phone, ''), phone, ''), '\D', '', 'g') AS digits
  FROM public.guest_contacts
),
ranked AS (
  SELECT id, user_id, digits,
         first_value(id) OVER (
           PARTITION BY user_id, digits
           ORDER BY (last_invited_at IS NULL), created_at, id
         ) AS keeper_id
  FROM norm
  WHERE digits <> ''
)
SELECT id AS loser_id, keeper_id FROM ranked WHERE id <> keeper_id;

UPDATE public.whatsapp_messages m SET guest_contact_id = x.keeper_id
FROM _gc_losers x WHERE m.guest_contact_id = x.loser_id;

UPDATE public.guest_message_log g SET guest_contact_id = x.keeper_id
FROM _gc_losers x WHERE g.guest_contact_id = x.loser_id;

UPDATE public.event_pledges p SET guest_contact_id = x.keeper_id
FROM _gc_losers x WHERE p.guest_contact_id = x.loser_id;

UPDATE public.seating_assignments s SET guest_contact_id = x.keeper_id
FROM _gc_losers x
WHERE s.guest_contact_id = x.loser_id
  AND NOT EXISTS (
    SELECT 1 FROM public.seating_assignments k
    WHERE k.table_id = s.table_id AND k.guest_contact_id = x.keeper_id
  );
DELETE FROM public.seating_assignments s USING _gc_losers x
WHERE s.guest_contact_id = x.loser_id;

-- An answered RSVP on a loser row beats a pending one on the keeper.
UPDATE public.guest_invitations k
SET rsvp_status = l.rsvp_status, responded_at = l.responded_at, party_size = l.party_size
FROM _gc_losers x
JOIN public.guest_invitations l ON l.guest_contact_id = x.loser_id
WHERE k.guest_contact_id = x.keeper_id AND k.event_id = l.event_id
  AND k.responded_at IS NULL AND l.responded_at IS NOT NULL;

UPDATE public.guest_invitations l SET guest_contact_id = x.keeper_id
FROM _gc_losers x
WHERE l.guest_contact_id = x.loser_id
  AND NOT EXISTS (
    SELECT 1 FROM public.guest_invitations k
    WHERE k.guest_contact_id = x.keeper_id AND k.event_id = l.event_id
  );
DELETE FROM public.guest_invitations l USING _gc_losers x
WHERE l.guest_contact_id = x.loser_id;

DELETE FROM public.guest_contacts g USING _gc_losers x WHERE g.id = x.loser_id;

DROP TABLE _gc_losers;

-- ── 2) Backfill: every guest linked to every one of its owner's events ──────
INSERT INTO public.guest_invitations (user_id, guest_contact_id, event_id)
SELECT g.user_id, g.id, e.id
FROM public.guest_contacts g
JOIN public.wedding_events e ON e.user_id = g.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.guest_invitations gi
  WHERE gi.guest_contact_id = g.id AND gi.event_id = e.id
);
