-- Customizable public pledge page ("CMS"). The couple can edit the wording,
-- colors and cover image shown on /pledge/<token> via the dashboard's Customize
-- editor. Stored as a single JSONB blob so the shape can evolve without further
-- migrations; an empty object means "use defaults" (the app falls back field by
-- field). No RLS change needed — couple_profiles already scopes rows by user_id,
-- and the public page reads only presentational fields server-side via token.

ALTER TABLE couple_profiles
  ADD COLUMN IF NOT EXISTS pledge_page JSONB NOT NULL DEFAULT '{}'::jsonb;
