-- Sweep of every SECURITY DEFINER function for the missing-REVOKE gap that
-- 20260722000003 closed on checkin_guest_invitation(): Postgres grants
-- EXECUTE to PUBLIC by default, and PostgREST exposes every public-schema
-- function as an RPC, so a SECURITY DEFINER function with no explicit
-- REVOKE is callable by anyone holding just the anon key.
--
-- Audited (2026-07-22) and left alone, deliberately:
--   - RLS helpers that policies and column defaults execute as the caller:
--     requesting_user_id(), cms_role(), is_workforce_admin(),
--     is_workforce_reader(), is_platform_admin(), is_vendor_member().
--     Revoking these from authenticated would break RLS itself.
--   - Trigger functions (RETURNS trigger) — not invocable via PostgREST RPC.
--   - merge_vendors() and checkin_guest_invitation() — already revoked.
--   - claim_gift_registry_unit() — SECURITY INVOKER, out of scope.
--
-- Everything below is only ever called from service-role server code or by
-- pg_cron (which runs as postgres, unaffected by these revokes) — verified
-- against every .rpc() call site in apps/ before writing this.

-- Anon could burn any couple's WhatsApp send credits (takes p_user_id as an
-- argument, no internal auth), or delete consumption rows for unlimited
-- free sends. Called only by opus_pass server code.
REVOKE ALL ON FUNCTION public.consume_send_credit(uuid, uuid, uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_send_credit(uuid, uuid, uuid, text, integer) TO service_role;

REVOKE ALL ON FUNCTION public.release_send_credit(uuid, uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_send_credit(uuid, uuid, uuid, text) TO service_role;

-- Anon could corrupt any guest's thank-you counters.
REVOKE ALL ON FUNCTION public.increment_thank_you_count(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_thank_you_count(uuid, uuid, uuid) TO service_role;

-- Cron entrypoints: anon could fire the pledge-reminder / MD-nudge edge
-- functions at will (mass message/email spam). pg_cron runs as postgres.
REVOKE ALL ON FUNCTION public.trigger_pledge_reminders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_pledge_reminders() TO service_role;

REVOKE ALL ON FUNCTION public.trigger_md_tracker_nudge() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_md_tracker_nudge() TO service_role;

-- Called by pg_cron nightly and by an admin server action (service-role).
REVOKE ALL ON FUNCTION public.workforce_generate_task_occurrences() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.workforce_generate_task_occurrences() TO service_role;

-- Dead code (no callers anywhere in apps/), but exposed: leaks the internal
-- hiring pipeline, and update_application_with_user_context would let anon
-- rewrite any job application and forge the audit trail's performed_by.
-- Revoked rather than dropped so any future server use keeps working.
REVOKE ALL ON FUNCTION public.get_job_application_counts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_application_counts() TO service_role;

REVOKE ALL ON FUNCTION public.update_application_with_user_context(uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_application_with_user_context(uuid, uuid, jsonb) TO service_role;

REVOKE ALL ON FUNCTION public.increment_vendor_view_count(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_vendor_view_count(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.increment_advice_ideas_post_view(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_advice_ideas_post_view(text) TO service_role;

-- The admin_whitelist table these read was dropped in 20260610000001 (the
-- real admin gate is workforce_employees.dashboard_access), so these are
-- orphans — and get_admin_whitelist_entry would leak admin emails/roles to
-- anon wherever a stray admin_whitelist table still exists (one was manually
-- re-created in prod at some point). Dropped outright, not revoked.
DROP FUNCTION IF EXISTS public.is_admin_whitelisted(text);
DROP FUNCTION IF EXISTS public.get_admin_whitelist_entry(text);
