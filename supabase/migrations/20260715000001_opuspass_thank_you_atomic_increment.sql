-- OpusPass: atomic increment for guest_invitations.thank_you_count.
--
-- sendThankYouMessages isn't quota-gated (see credit_consumptions), but it
-- still needs an accurate per-guest send counter. The application-code
-- version of this (SELECT thank_you_count, then UPDATE with count+1) is a
-- read-then-write race: two overlapping sends for the same guest (a
-- double-click, or two overlapping requests) can both read the same count
-- and both write count+1, undercounting. This RPC does the increment in one
-- statement so Postgres's own row-level locking serializes it.

CREATE OR REPLACE FUNCTION public.increment_thank_you_count(
  p_user_id UUID,
  p_event_id UUID,
  p_guest_contact_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.guest_invitations
  SET thank_you_sent_at = now(),
      thank_you_count = thank_you_count + 1
  WHERE user_id = p_user_id
    AND event_id = p_event_id
    AND guest_contact_id = p_guest_contact_id;
END;
$$;

COMMENT ON FUNCTION public.increment_thank_you_count IS
  'Atomically bumps guest_invitations.thank_you_count + stamps thank_you_sent_at for one guest. Replaces the non-atomic select-then-update pattern in markThankYouSent.';
