-- OF-VND-0006 GAP 3: vendor reviews pipeline
--
-- Couples submit reviews against an active vendor; an admin moderates them
-- (approve / reject / hide); the website aggregates only `published` rows
-- into the rating + reviewCount the public profile shows.
--
-- The `reviews` table from migration 002 was scoped to inquiries -> couples
-- (logged-in only) and stalled because anonymous review submission has
-- different validation needs. `vendor_reviews` is a fresh, simpler table
-- whose only invariant is the moderation status: rows go in as `pending`
-- and only become public when an admin flips them to `published`.

CREATE TABLE IF NOT EXISTS public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,

  -- Submitter identity. We accept anonymous submissions but require an
  -- email so admin can verify it's a real person before publishing. The
  -- email is never shown publicly — `author_name` is what couples see.
  author_name VARCHAR(120) NOT NULL,
  author_email VARCHAR(254) NOT NULL,

  -- Content. `rating` is 1.0–5.0 in 0.5 steps (validated app-side; DB
  -- only enforces the range so a corrupt write can't poison aggregates).
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL CHECK (length(body) >= 10),
  wedding_date DATE,

  -- Moderation. Pending = awaiting admin; published = visible publicly;
  -- rejected = admin declined (kept for audit, never shown publicly).
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'rejected')),
  rejection_reason TEXT,

  -- Audit trail. `submitted_ip` helps spot abuse spikes from a single
  -- source; `reviewed_by` ties moderation actions to the admin user.
  submitted_ip INET,
  submitted_user_agent TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_status_created
  ON public.vendor_reviews (vendor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_status_pending_created
  ON public.vendor_reviews (created_at DESC)
  WHERE status = 'pending';

-- Live aggregate as a view so the website mapper doesn't have to keep a
-- denormalised `vendors.stats` JSONB in sync. The view counts only
-- published rows so admin's pending queue has zero effect on what the
-- public sees.
CREATE OR REPLACE VIEW public.vendor_review_stats AS
  SELECT
    vendor_id,
    AVG(rating)::NUMERIC(3, 2) AS average_rating,
    COUNT(*) AS review_count
  FROM public.vendor_reviews
  WHERE status = 'published'
  GROUP BY vendor_id;

COMMENT ON TABLE public.vendor_reviews
  IS 'Couple-submitted vendor reviews. Insert lands in `pending`; admin moderates to `published` or `rejected`. Public site reads only `published`.';
COMMENT ON VIEW public.vendor_review_stats
  IS 'Per-vendor average + count over `published` reviews. Used by the website mapper so `vendors.stats` JSONB can stay legacy.';

-- updated_at maintenance — re-use the trigger fn from migration 001.
DROP TRIGGER IF EXISTS update_vendor_reviews_updated_at ON public.vendor_reviews;
CREATE TRIGGER update_vendor_reviews_updated_at
  BEFORE UPDATE ON public.vendor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS — service role bypasses everything, so the website (server-side) and
-- admin (admin client) both work. Anonymous client writes are forbidden;
-- review submission goes through a Next server action that uses the admin
-- client. Public reads are scoped to `published` rows only.
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published reviews" ON public.vendor_reviews;
CREATE POLICY "Public can read published reviews" ON public.vendor_reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

NOTIFY pgrst, 'reload schema';
