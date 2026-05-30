-- Per-couple Pledge token: an unguessable string the couple shares (e.g. in a
-- WhatsApp group) so people can self-submit a pledge via the public
-- /pledge/<token> page. Submissions create a guest_contacts row + an
-- event_pledges row scoped to the owning couple.
--
-- Kept separate from collector_token so the contact-collection and pledge links
-- can be shared (and, later, disabled) independently. Generated automatically on
-- insert / for existing rows so every couple gets one without provisioning.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS pledge_token TEXT UNIQUE
  DEFAULT encode(gen_random_bytes(16), 'hex');

UPDATE public.users
  SET pledge_token = encode(gen_random_bytes(16), 'hex')
  WHERE pledge_token IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_pledge_token ON public.users(pledge_token);
