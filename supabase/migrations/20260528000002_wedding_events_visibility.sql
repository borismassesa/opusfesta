-- Two website-display booleans for wedding_events, used by the redesigned
-- couple-dashboard Events editor (Zola-style two-column inline form):
--
--   is_public  — show this event on the public wedding website. Defaults TRUE
--                to match the existing implicit behaviour where every event
--                created via the dashboard was visible.
--   allow_rsvp — let guests RSVP to this event directly from the wedding
--                website (in addition to their personal RSVP link). Defaults
--                FALSE so existing events stay link-only until the couple
--                opts in.
--
-- Idempotent via `IF NOT EXISTS`.

ALTER TABLE wedding_events
  ADD COLUMN IF NOT EXISTS is_public  BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_rsvp BOOLEAN NOT NULL DEFAULT false;
