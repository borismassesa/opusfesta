-- checkin_guest_invitation() is SECURITY DEFINER but was never locked down —
-- Postgres grants EXECUTE to PUBLIC by default on function creation, and
-- PostgREST exposes every public-schema function as an RPC endpoint to any
-- role that can execute it. That meant POST /rest/v1/rpc/checkin_guest_invitation
-- was callable with just the anon/publishable key: no door accessToken, no
-- event check, nothing — a guest holding their own (HMAC-signed but not
-- encrypted) entrance-pass QR payload could decode their own invitationId
-- and self-check-in directly, bypassing the whole door-code auth model.
--
-- Same pattern already fixed correctly elsewhere in this codebase, see
-- 20260603000001_merge_vendors_function.sql's revoke for merge_vendors().
revoke all on function public.checkin_guest_invitation(uuid, text, text, int) from public, anon, authenticated;
grant execute on function public.checkin_guest_invitation(uuid, text, text, int) to service_role;

-- The "arrived <= invited" invariant was previously enforced only inside
-- this one function, via LEAST/GREATEST clamping — but api/checkin/amend
-- writes checked_in_party_size through a direct table UPDATE with its own
-- separate JS-side clamp, not through this function. Backstop the invariant
-- at the column itself so it holds regardless of which code path writes it.
ALTER TABLE guest_invitations
  ADD CONSTRAINT checked_in_party_size_range
  CHECK (
    checked_in_party_size IS NULL
    OR checked_in_party_size BETWEEN 1 AND GREATEST(COALESCE(party_size, 1), 1)
  );
