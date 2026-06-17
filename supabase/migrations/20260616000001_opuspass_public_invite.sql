-- OpusPass public invitation hub
--
-- One shareable, no-login link per couple — /i/<slug> — that unfurls into a
-- branded WhatsApp preview and lets brand-new guests self-RSVP. It is distinct
-- from the per-guest personal /rsvp/<token> links:
--
--   * The PUBLIC link carries NO PII and is meant to be forwarded freely.
--   * The PERSONAL link pre-fills a named guest and must never be broadcast.
--
-- Anti-hijack: a self-RSVP from the public link always creates a NEW
-- guest_contacts row tagged source='public', review_status='unconfirmed', so a
-- forwarded link can never overwrite (or RSVP as) an existing named guest. The
-- host approves/merges these from a review queue.

-- 1) couple_profiles — public-sharing identity
--    public_slug             readable, unguessable-enough handle in the URL
--                            (generated from the couple's names when sharing is
--                            first enabled; nullable until then).
--    cover_image_url         the image composited into the OG unfurl + hero.
--    public_sharing_enabled  master on/off so a leaked link can be revoked.
ALTER TABLE public.couple_profiles
  ADD COLUMN IF NOT EXISTS public_slug             TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS cover_image_url         TEXT,
  ADD COLUMN IF NOT EXISTS public_sharing_enabled  BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_couple_profiles_public_slug
  ON public.couple_profiles(public_slug);

-- 2) guest_contacts — provenance + review state
--    source         'host'   — added by the couple (default; existing rows).
--                   'public' — self-registered via the public /i/<slug> link.
--    review_status  'confirmed'   — trusted (default; existing rows).
--                   'unconfirmed' — awaiting host approval (public self-RSVPs).
ALTER TABLE public.guest_contacts
  ADD COLUMN IF NOT EXISTS source        TEXT NOT NULL DEFAULT 'host',
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'confirmed';

-- Powers the dashboard "needs review" queue (owner-scoped).
CREATE INDEX IF NOT EXISTS idx_guest_contacts_review
  ON public.guest_contacts(user_id, review_status);

-- Public reads/writes go through the service-role client in trusted server
-- actions (getPublicInvite / submitPublicInviteRsvp), so no anon RLS policy is
-- added here — consistent with the existing pledge/collector public pages.
-- Cover images reuse the existing public 'pledge-covers' storage bucket.
