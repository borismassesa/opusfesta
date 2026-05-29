-- Fundraising goal for the contributions drive. The couple sets a single target
-- amount in Settings; the Reports tab shows progress toward it (raised vs goal)
-- and a progress bar. Nullable — null means "no goal set" and the report simply
-- omits the goal/progress section. Stored on couple_profiles alongside the other
-- pledge-collection settings; no RLS change needed (rows are already scoped by
-- user_id). Amounts are whole TZS, so NUMERIC(14,0) is plenty of headroom.

ALTER TABLE couple_profiles
  ADD COLUMN IF NOT EXISTS pledge_goal_amount NUMERIC(14, 0);
