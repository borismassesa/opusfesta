-- Let the OpusPass mobile app write to the couple-dashboard tables.
--
-- These tables denormalize ownership onto user_id (-> users.id) so RLS stays a
-- simple `requesting_user_id() = user_id` check. That works fine for the web
-- app, which writes through server actions that have already resolved the
-- signed-in user's Supabase UUID and can pass user_id explicitly.
--
-- The mobile app has no server-action layer: it talks to PostgREST directly
-- with the Clerk JWT attached, and never learns its own users.id. Every insert
-- therefore failed the NOT NULL on user_id before RLS even ran.
--
-- Giving user_id the same `DEFAULT requesting_user_id()` that
-- invitation_product_favorites already uses (see
-- 20260720000001_opuspass_invitation_product_favorites.sql) closes that gap:
-- the column resolves from the caller's own JWT, so a client can only ever
-- default it to itself, and the existing WITH CHECK policy still rejects any
-- attempt to pass someone else's id explicitly.
--
-- Purely additive: existing rows and existing explicit-user_id writes from the
-- web app are unaffected.

ALTER TABLE public.wedding_events
  ALTER COLUMN user_id SET DEFAULT requesting_user_id();

ALTER TABLE public.guest_contacts
  ALTER COLUMN user_id SET DEFAULT requesting_user_id();

ALTER TABLE public.guest_invitations
  ALTER COLUMN user_id SET DEFAULT requesting_user_id();

ALTER TABLE public.rsvp_questions
  ALTER COLUMN user_id SET DEFAULT requesting_user_id();

ALTER TABLE public.rsvp_answers
  ALTER COLUMN user_id SET DEFAULT requesting_user_id();
