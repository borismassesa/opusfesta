-- Vendor category requests: when a vendor picks "Something else" during
-- onboarding, we record their custom label here so admins can triage it and
-- promote it to a real category without a code build.

CREATE TABLE IF NOT EXISTS public.vendor_category_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id       uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  requested_label text NOT NULL CHECK (char_length(requested_label) <= 80),
  status          text NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid REFERENCES public.users(id),
  UNIQUE (vendor_id)
);

CREATE INDEX idx_vendor_category_requests_status
  ON public.vendor_category_requests(status);

-- RLS
ALTER TABLE public.vendor_category_requests ENABLE ROW LEVEL SECURITY;

-- Admins can read and update all requests
CREATE POLICY "vendor_category_requests_admin_all"
  ON public.vendor_category_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vendors can read their own request
CREATE POLICY "vendor_category_requests_vendor_read"
  ON public.vendor_category_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE id = vendor_id AND user_id = auth.uid()
    )
  );
