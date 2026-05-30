-- Schedule the pledge-reminders edge function (daily). This drives the
-- *automated* reminder path. It is intentionally defensive:
--   * The edge function itself no-ops on sending unless MESSAGING_PROVIDER is
--     set, so until a messaging provider is wired the cron sweep simply reports
--     the backlog and the dashboard "Reminders due" queue remains the path.
--   * Scheduling is guarded so this migration still succeeds in environments
--     where pg_cron / pg_net can't be enabled or the project settings aren't
--     configured.
--
-- The function URL and service key are read from database settings so no secret
-- is hard-coded in git. Configure them once per project, e.g.:
--   ALTER DATABASE postgres SET app.settings.edge_base_url = 'https://<ref>.supabase.co/functions/v1';
--   ALTER DATABASE postgres SET app.settings.service_role_key = '<service-role-key>';

CREATE OR REPLACE FUNCTION public.trigger_pledge_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url TEXT := current_setting('app.settings.edge_base_url', true);
  service_key TEXT := current_setting('app.settings.service_role_key', true);
BEGIN
  IF base_url IS NULL OR service_key IS NULL THEN
    RAISE NOTICE 'pledge-reminders not triggered: set app.settings.edge_base_url and app.settings.service_role_key';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url     := base_url || '/pledge-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body    := '{}'::jsonb
  );
END;
$$;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  CREATE EXTENSION IF NOT EXISTS pg_net;
  -- 06:00 EAT (UTC+3) -> 03:00 UTC, daily. cron.schedule upserts by job name.
  PERFORM cron.schedule(
    'pledge-reminders-daily',
    '0 3 * * *',
    'SELECT public.trigger_pledge_reminders();'
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pledge-reminders cron scheduling skipped (enable pg_cron + pg_net to automate): %', SQLERRM;
END $$;
