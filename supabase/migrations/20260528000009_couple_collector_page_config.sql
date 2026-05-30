-- Customizable public Contact Collector page (mirrors pledge_page). The couple
-- can edit the wording, colors and cover image shown on /collect/<token> via the
-- dashboard's Customize editor. Stored as a single JSONB blob; empty object means
-- "use defaults". Cover photos reuse the public 'pledge-covers' storage bucket.

ALTER TABLE couple_profiles
  ADD COLUMN IF NOT EXISTS collector_page JSONB NOT NULL DEFAULT '{}'::jsonb;
