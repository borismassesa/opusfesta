-- Rate limiting for the door check-in API (apps/opus_pass/src/app/api/checkin/*).
--
-- Those routes authenticate with a bearer door code and, on the manual
-- fallback path, a 6-character guest entry_code. Neither had any throttle,
-- so anyone holding one valid door code could script-enumerate entry codes
-- to mass-check-in guests or fingerprint an event's roster, and the login
-- routes could be hammered to brute-force door codes.
--
-- No rate-limiting primitive exists in this codebase (no Redis/Upstash), so
-- this is a Postgres-backed fixed-window counter. Traffic is tiny — a door
-- scanner peaks at a request every couple of seconds — so one extra DB
-- round-trip per request is fine, and a fixed window (rather than a sliding
-- one) keeps it to a single atomic upsert.

CREATE TABLE checkin_rate_limits (
  bucket_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket_key, window_start)
);

-- RLS on, zero policies: nothing but the service-role client (which bypasses
-- RLS) can touch the table directly.
ALTER TABLE checkin_rate_limits ENABLE ROW LEVEL SECURITY;

-- Returns TRUE if this request is within the limit, FALSE if it should be
-- rejected. One atomic upsert per call; the count includes the current
-- request, so p_max is the total allowed per window.
CREATE OR REPLACE FUNCTION checkin_rate_limit(
  p_key TEXT,
  p_max INT,
  p_window_seconds INT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_window TIMESTAMPTZ;
BEGIN
  v_window := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );

  INSERT INTO checkin_rate_limits (bucket_key, window_start, count)
  VALUES (p_key, v_window, 1)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET count = checkin_rate_limits.count + 1
  RETURNING count INTO v_count;

  -- Opportunistic GC: windows are minutes long, so anything older than an
  -- hour is dead weight. ~1% of calls pay the sweep; no cron needed.
  IF random() < 0.01 THEN
    DELETE FROM checkin_rate_limits WHERE window_start < now() - INTERVAL '1 hour';
  END IF;

  RETURN v_count <= p_max;
END;
$$;

-- SECURITY DEFINER without a REVOKE is an unauthenticated PostgREST RPC —
-- the exact gap 20260722000003 just closed on checkin_guest_invitation().
-- Locked to service_role from day one.
REVOKE ALL ON FUNCTION checkin_rate_limit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION checkin_rate_limit(TEXT, INT, INT) TO service_role;
