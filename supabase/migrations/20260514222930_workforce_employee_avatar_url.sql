-- Cache the Clerk profile picture URL on workforce_employees so the
-- workforce UI can show real photos in lists/avatars without making a
-- Clerk users.getUser() call per row. Populated by the application at
-- the two moments we have a Clerk User in hand:
--   * inviteEmployee() — when the email already maps to a Clerk user
--     (we link directly instead of sending an invitation)
--   * acceptInvitation() — when the invitee finishes signing up
--
-- Nullable on purpose: employees who haven't accepted an invite (or
-- haven't been linked to a Clerk account at all) fall back to the
-- existing initials-on-coloured-circle avatar.

ALTER TABLE workforce_employees
  ADD COLUMN IF NOT EXISTS avatar_url text;

NOTIFY pgrst, 'reload schema';
