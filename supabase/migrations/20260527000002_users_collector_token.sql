-- Per-couple Contact Collector token: an unguessable string the couple shares
-- (e.g. by WhatsApp) so guests can self-fill their contact info via the public
-- /collect/<token> page. Submissions land directly in guest_contacts as new rows.
--
-- The token is generated automatically on insert / for existing rows so every
-- couple gets one without an extra provisioning step.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS collector_token TEXT UNIQUE
  DEFAULT encode(gen_random_bytes(16), 'hex');

UPDATE public.users
  SET collector_token = encode(gen_random_bytes(16), 'hex')
  WHERE collector_token IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_collector_token ON public.users(collector_token);
