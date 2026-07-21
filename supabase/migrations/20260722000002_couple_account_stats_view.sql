-- OpusPass: per-couple activity rollup, powering admin's Couple Accounts list.
--
-- Why a view and not JS aggregation: PostgREST hard-caps every response at
-- db-max-rows (1000 on this project). guest_invitations is already past that,
-- so fetching the raw rows and counting them in the app would silently
-- undercount — and get worse as the platform grows. Counting in SQL keeps the
-- list page to a single round trip with no truncation cliff.
--
-- One row per public.users row (not filtered to role = 'user') so the caller
-- decides who counts as a couple; admin filters on users.role.

CREATE OR REPLACE VIEW public.couple_account_stats AS
  SELECT
    u.id AS user_id,

    (SELECT count(*)::INT FROM public.wedding_events e WHERE e.user_id = u.id) AS event_count,
    (SELECT count(*)::INT FROM public.guest_contacts g WHERE g.user_id = u.id) AS guest_count,
    (SELECT count(*)::INT FROM public.guest_invitations i WHERE i.user_id = u.id) AS invitation_count,
    (SELECT count(*)::INT FROM public.guest_invitations i
      WHERE i.user_id = u.id AND i.rsvp_status = 'attending') AS rsvp_attending,
    (SELECT count(*)::INT FROM public.guest_invitations i
      WHERE i.user_id = u.id AND i.rsvp_status = 'pending') AS rsvp_pending,

    (SELECT count(*)::INT FROM public.invitation_orders o WHERE o.user_id = u.id) AS order_count,
    (SELECT count(*)::INT FROM public.invitation_orders o
      WHERE o.user_id = u.id AND o.status = 'paid') AS paid_order_count,
    -- Lifetime spend counts paid orders only, and only in TZS: every order
    -- this platform has taken is TZS, and mixing currencies into one total
    -- would be wrong rather than merely incomplete.
    (SELECT COALESCE(sum(o.amount_total), 0)::BIGINT FROM public.invitation_orders o
      WHERE o.user_id = u.id AND o.status = 'paid' AND o.currency = 'TZS') AS lifetime_spend_tzs,

    (SELECT count(*)::INT FROM public.event_pledges p WHERE p.user_id = u.id) AS pledge_count,
    (SELECT count(*)::INT FROM public.gift_registry_items r WHERE r.user_id = u.id) AS registry_item_count,
    (SELECT count(*)::INT FROM public.guestbook_entries b WHERE b.user_id = u.id) AS guestbook_count,

    -- GREATEST ignores NULLs in Postgres, so a couple who only ever created a
    -- profile still gets a sensible timestamp and a couple who created
    -- nothing gets NULL (which the UI reads as "dormant").
    GREATEST(
      (SELECT max(e.updated_at) FROM public.wedding_events e WHERE e.user_id = u.id),
      (SELECT max(g.updated_at) FROM public.guest_contacts g WHERE g.user_id = u.id),
      (SELECT max(i.updated_at) FROM public.guest_invitations i WHERE i.user_id = u.id),
      (SELECT max(o.created_at) FROM public.invitation_orders o WHERE o.user_id = u.id),
      (SELECT max(p.updated_at) FROM public.event_pledges p WHERE p.user_id = u.id),
      (SELECT max(r.updated_at) FROM public.gift_registry_items r WHERE r.user_id = u.id),
      (SELECT cp.updated_at FROM public.couple_profiles cp WHERE cp.user_id = u.id)
    ) AS last_activity_at
  FROM public.users u;

COMMENT ON VIEW public.couple_account_stats
  IS 'Per-couple activity rollup (events, guests, RSVPs, orders, spend, pledges, registry, guestbook) for admin''s Couple Accounts list. Staff-only: revoked from anon and authenticated, read via the service-role client.';

-- This view crosses every couple's data, so it must never be reachable from a
-- couple's own JWT. Revoking the roles PostgREST authenticates as is what
-- enforces that: a view does not inherit the base tables' RLS.
REVOKE ALL ON public.couple_account_stats FROM anon, authenticated;
GRANT SELECT ON public.couple_account_stats TO service_role;


-- Same idea one level down: one row per event, for the Couple Accounts
-- console's event cards and its ?event= scoped tabs.
CREATE OR REPLACE VIEW public.couple_event_stats AS
  SELECT
    e.id AS event_id,
    e.user_id,

    (SELECT count(*)::INT FROM public.guest_invitations i WHERE i.event_id = e.id) AS invitation_count,
    (SELECT count(*)::INT FROM public.guest_invitations i
      WHERE i.event_id = e.id AND i.rsvp_status = 'attending') AS rsvp_attending,
    (SELECT count(*)::INT FROM public.guest_invitations i
      WHERE i.event_id = e.id AND i.rsvp_status = 'declined') AS rsvp_declined,
    (SELECT count(*)::INT FROM public.guest_invitations i
      WHERE i.event_id = e.id AND i.rsvp_status = 'maybe') AS rsvp_maybe,
    (SELECT count(*)::INT FROM public.guest_invitations i
      WHERE i.event_id = e.id AND i.rsvp_status = 'pending') AS rsvp_pending,
    -- Expected headcount: what attending guests said they are bringing.
    (SELECT COALESCE(sum(i.party_size), 0)::INT FROM public.guest_invitations i
      WHERE i.event_id = e.id AND i.rsvp_status = 'attending') AS expected_headcount,
    (SELECT count(*)::INT FROM public.guest_invitations i
      WHERE i.event_id = e.id AND i.checked_in_at IS NOT NULL) AS checked_in_count,
    (SELECT COALESCE(sum(COALESCE(i.checked_in_party_size, 1)), 0)::INT FROM public.guest_invitations i
      WHERE i.event_id = e.id AND i.checked_in_at IS NOT NULL) AS checked_in_headcount,

    (SELECT count(*)::INT FROM public.event_pledges p WHERE p.event_id = e.id) AS pledge_count,
    (SELECT count(*)::INT FROM public.gift_registry_items r WHERE r.event_id = e.id) AS registry_item_count,
    (SELECT count(*)::INT FROM public.guestbook_entries b WHERE b.event_id = e.id) AS guestbook_count,
    (SELECT count(*)::INT FROM public.seating_tables t WHERE t.event_id = e.id) AS seating_table_count,

    (SELECT count(*)::INT FROM public.invitation_orders o
      WHERE o.event_id = e.id AND o.status = 'paid') AS paid_order_count,
    (SELECT COALESCE(sum(o.amount_total), 0)::BIGINT FROM public.invitation_orders o
      WHERE o.event_id = e.id AND o.status = 'paid' AND o.currency = 'TZS') AS spend_tzs
  FROM public.wedding_events e;

COMMENT ON VIEW public.couple_event_stats
  IS 'Per-event rollup (RSVPs, headcount, door check-ins, pledges, registry, guestbook, seating, spend) for admin''s Couple Accounts console. Staff-only, same access rules as couple_account_stats.';

REVOKE ALL ON public.couple_event_stats FROM anon, authenticated;
GRANT SELECT ON public.couple_event_stats TO service_role;
