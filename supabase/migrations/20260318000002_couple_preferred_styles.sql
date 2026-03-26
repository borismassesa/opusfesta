-- Add preferred_styles and preferred_designs columns to couple_profiles
-- Stores venue style preferences (garden, beach, ballroom, etc.)
-- and design/stationery preferences (classic, modern, bohemian, etc.)
ALTER TABLE couple_profiles
  ADD COLUMN IF NOT EXISTS preferred_styles TEXT[] DEFAULT '{}';

ALTER TABLE couple_profiles
  ADD COLUMN IF NOT EXISTS preferred_designs TEXT[] DEFAULT '{}';
