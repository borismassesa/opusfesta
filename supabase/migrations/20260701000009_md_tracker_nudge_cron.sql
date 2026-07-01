-- Schedule the MD Daily Tracker nudge (daily) — proactively emails an
-- engine's MD(s) when yesterday's entry is missing, instead of only
-- surfacing "missed" passively when someone opens the dashboard. Mirrors
-- the defensive pattern in 20260528000005_pledge_reminders_cron.sql, but
-- targets the opus_admin Next.js API route directly (not a Supabase edge
-- function), since that's where the tracker itself lives.
--
-- One-time setup (same idea as edge_base_url/service_role_key already used
-- by the pledge-reminders cron):
--   ALTER DATABASE postgres SET app.settings.opus_admin_base_url = 'https://admin.opusfesta.com';
--   ALTER DATABASE postgres SET app.settings.md_tracker_cron_secret = '<matches MD_TRACKER_CRON_SECRET on Vercel>';

CREATE OR REPLACE FUNCTION public.trigger_md_tracker_nudge()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url TEXT := current_setting('app.settings.opus_admin_base_url', true);
  secret TEXT := current_setting('app.settings.md_tracker_cron_secret', true);
BEGIN
  IF base_url IS NULL OR secret IS NULL THEN
    RAISE NOTICE 'md-tracker nudge not triggered: set app.settings.opus_admin_base_url and app.settings.md_tracker_cron_secret';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url     := base_url || '/api/md-tracker/nudge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || secret
    ),
    body    := '{}'::jsonb
  );
END;
$$;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  CREATE EXTENSION IF NOT EXISTS pg_net;
  -- 18:30 EAT (UTC+3) -> 15:30 UTC, daily. cron.schedule upserts by job name.
  PERFORM cron.schedule(
    'md-tracker-nudge-daily',
    '30 15 * * *',
    'SELECT public.trigger_md_tracker_nudge();'
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'md-tracker nudge cron scheduling skipped (enable pg_cron + pg_net to automate): %', SQLERRM;
END $$;
