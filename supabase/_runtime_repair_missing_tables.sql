-- Runtime repair: re-create the three tables your DB is missing despite the
-- migration tracker claiming they were applied.
--
-- Tables created here:
--   * reviews (and supporting enum/functions/triggers/policies)
--   * invoices, payments, payouts, payment_methods
--   * vendor_views
--
-- The tracker (supabase_migrations.schema_migrations) is NOT touched —
-- entries 002, 010, 011, 012, 038 already exist. Don't add them again.
--
-- Safe to re-run: every CREATE uses IF NOT EXISTS or DROP-then-CREATE
-- guards so partial state from a previous attempt doesn't break things.

-- =========================================================================
-- 002 + 010 + 011: reviews
-- =========================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  event_type VARCHAR(100),
  event_date DATE,
  verified BOOLEAN DEFAULT false,
  helpful INTEGER DEFAULT 0,
  vendor_response TEXT,
  vendor_responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_vendor_review UNIQUE (user_id, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(verified);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Moderation enum (010)
DO $$ BEGIN
  CREATE TYPE review_moderation_status AS ENUM ('pending','approved','rejected','flagged');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Moderation columns (010)
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderation_status review_moderation_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS flagged_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_reviews_moderation_status ON reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_reviews_inquiry_id ON reviews(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pending_moderation ON reviews(moderation_status) WHERE moderation_status = 'pending';

-- vendor stats trigger fn (010 version, only counts approved)
CREATE OR REPLACE FUNCTION update_vendor_rating_stats() RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendors
  SET stats = jsonb_set(
    jsonb_set(
      stats,
      '{averageRating}',
      to_jsonb(COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM reviews
        WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
          AND moderation_status = 'approved'
      ), 0))
    ),
    '{reviewCount}',
    to_jsonb((
      SELECT COUNT(*) FROM reviews
      WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
        AND moderation_status = 'approved'
    ))
  )
  WHERE id = COALESCE(NEW.vendor_id, OLD.vendor_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vendor_rating_on_review_insert ON reviews;
CREATE TRIGGER update_vendor_rating_on_review_insert AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_vendor_rating_stats();
DROP TRIGGER IF EXISTS update_vendor_rating_on_review_update ON reviews;
CREATE TRIGGER update_vendor_rating_on_review_update AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_vendor_rating_stats();
DROP TRIGGER IF EXISTS update_vendor_rating_on_review_delete ON reviews;
CREATE TRIGGER update_vendor_rating_on_review_delete AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_vendor_rating_stats();

CREATE OR REPLACE FUNCTION increment_review_helpful(review_uuid UUID) RETURNS VOID AS $$
BEGIN UPDATE reviews SET helpful = helpful + 1 WHERE id = review_uuid; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view verified reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (
  moderation_status = 'approved'
  OR auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM vendors WHERE vendors.id = reviews.vendor_id AND vendors.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
CREATE POLICY "Admins can view all reviews" ON reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can respond to their reviews" ON reviews;
CREATE POLICY "Vendors can respond to their reviews" ON reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM vendors WHERE vendors.id = reviews.vendor_id AND vendors.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can moderate reviews" ON reviews;
CREATE POLICY "Admins can moderate reviews" ON reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Reviewer-eligibility helpers (010 + 011)
CREATE OR REPLACE FUNCTION can_user_review_vendor(user_uuid UUID, vendor_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE has_completed_inquiry BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM inquiries
    WHERE inquiries.user_id = user_uuid
      AND inquiries.vendor_id = vendor_uuid
      AND inquiries.status IN ('accepted', 'responded')
      AND inquiries.event_date IS NOT NULL
      AND inquiries.event_date <= CURRENT_DATE
  ) INTO has_completed_inquiry;
  RETURN has_completed_inquiry;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION check_no_duplicate_review(p_user_id UUID, p_vendor_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM reviews WHERE user_id = p_user_id AND vendor_id = p_vendor_id);
END;
$$ LANGUAGE plpgsql STABLE;

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND can_user_review_vendor(auth.uid(), vendor_id)
  AND check_no_duplicate_review(auth.uid(), vendor_id)
);

CREATE OR REPLACE FUNCTION approve_review(review_uuid UUID, moderator_uuid UUID) RETURNS VOID AS $$
BEGIN
  UPDATE reviews SET moderation_status = 'approved', verified = true,
    moderated_at = CURRENT_TIMESTAMP, moderated_by = moderator_uuid WHERE id = review_uuid;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reject_review(review_uuid UUID, moderator_uuid UUID, rejection_reason TEXT DEFAULT NULL) RETURNS VOID AS $$
BEGIN
  UPDATE reviews SET moderation_status = 'rejected', moderation_notes = rejection_reason,
    moderated_at = CURRENT_TIMESTAMP, moderated_by = moderator_uuid WHERE id = review_uuid;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION flag_review(review_uuid UUID, flag_reason TEXT) RETURNS VOID AS $$
BEGIN
  UPDATE reviews SET moderation_status = 'flagged', flagged_reason = flag_reason,
    moderated_at = CURRENT_TIMESTAMP WHERE id = review_uuid;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_verify_review_on_insert() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.inquiry_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = NEW.inquiry_id AND inquiries.status IN ('accepted', 'responded')) THEN
      NEW.moderation_status := 'approved'; NEW.verified := true;
    ELSE
      NEW.moderation_status := 'pending'; NEW.verified := false;
    END IF;
  ELSE
    NEW.moderation_status := 'pending'; NEW.verified := false;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_verify_review_insert ON reviews;
CREATE TRIGGER auto_verify_review_insert BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION auto_verify_review_on_insert();

-- =========================================================================
-- 012: invoices + payments + payouts + payment_methods
-- =========================================================================

DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('MPESA','AIRTEL_MONEY','TIGO_PESA','HALO_PESA','STRIPE_CARD','STRIPE_BANK','PAYPAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('PENDING','PROCESSING','SUCCEEDED','FAILED','CANCELLED','REFUNDED','PARTIALLY_REFUNDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE invoice_status AS ENUM ('DRAFT','PENDING','PAID','PARTIALLY_PAID','OVERDUE','CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE invoice_type AS ENUM ('DEPOSIT','FULL_PAYMENT','BALANCE','ADDITIONAL_SERVICE','REFUND'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  type invoice_type NOT NULL DEFAULT 'FULL_PAYMENT',
  status invoice_status NOT NULL DEFAULT 'DRAFT',
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  description TEXT, notes TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  provider VARCHAR(50) NOT NULL,
  provider_ref VARCHAR(255),
  provider_metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  refund_amount DECIMAL(12, 2) DEFAULT 0,
  refunded_at TIMESTAMP WITH TIME ZONE,
  description TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  provider VARCHAR(50) NOT NULL,
  provider_ref VARCHAR(255),
  provider_metadata JSONB DEFAULT '{}',
  account_number VARCHAR(255),
  account_name VARCHAR(255),
  bank_name VARCHAR(255),
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  description TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type payment_method NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_ref VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  provider_metadata JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider, provider_ref)
);

CREATE INDEX IF NOT EXISTS idx_invoices_inquiry_id ON invoices(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status IN ('PENDING', 'OVERDUE');
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_inquiry_id ON payments(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_vendor_id ON payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON payments(provider_ref);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payouts_vendor_id ON payouts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default) WHERE is_default = true;

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_payouts_updated_at ON payouts;
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION generate_invoice_number() RETURNS TEXT AS $$
DECLARE new_number TEXT; year_part TEXT; seq_num INTEGER;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1 INTO seq_num
  FROM invoices WHERE invoice_number LIKE 'INV-' || year_part || '-%';
  new_number := 'INV-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
  RETURN new_number;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_invoice_paid_amount() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE invoices SET
      paid_amount = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id AND status = 'SUCCEEDED'),
      status = CASE
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id AND status = 'SUCCEEDED') >= total_amount THEN 'PAID'::invoice_status
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id AND status = 'SUCCEEDED') > 0 THEN 'PARTIALLY_PAID'::invoice_status
        ELSE status END,
      paid_at = CASE
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id AND status = 'SUCCEEDED') >= total_amount THEN CURRENT_TIMESTAMP
        ELSE paid_at END
    WHERE id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_on_payment ON payments;
CREATE TRIGGER update_invoice_on_payment AFTER INSERT OR UPDATE OF status, amount ON payments
  FOR EACH ROW EXECUTE FUNCTION update_invoice_paid_amount();

CREATE OR REPLACE FUNCTION mark_overdue_invoices() RETURNS INTEGER AS $$
DECLARE updated_count INTEGER;
BEGIN
  UPDATE invoices SET status = 'OVERDUE'::invoice_status
  WHERE status = 'PENDING'::invoice_status AND due_date < CURRENT_DATE AND paid_amount < total_amount;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END; $$ LANGUAGE plpgsql;

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Vendors can view their invoices" ON invoices;
CREATE POLICY "Vendors can view their invoices" ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM vendors WHERE vendors.id = invoices.vendor_id AND vendors.user_id = auth.uid()));
DROP POLICY IF EXISTS "Vendors can create invoices" ON invoices;
CREATE POLICY "Vendors can create invoices" ON invoices FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM vendors WHERE vendors.id = invoices.vendor_id AND vendors.user_id = auth.uid()));
DROP POLICY IF EXISTS "Vendors can update their invoices" ON invoices;
CREATE POLICY "Vendors can update their invoices" ON invoices FOR UPDATE USING (
  EXISTS (SELECT 1 FROM vendors WHERE vendors.id = invoices.vendor_id AND vendors.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
CREATE POLICY "Admins can view all invoices" ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Vendors can view payments for their invoices" ON payments;
CREATE POLICY "Vendors can view payments for their invoices" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id AND
    EXISTS (SELECT 1 FROM vendors WHERE vendors.id = invoices.vendor_id AND vendors.user_id = auth.uid())));
DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

DROP POLICY IF EXISTS "Users can manage their own payment methods" ON payment_methods;
CREATE POLICY "Users can manage their own payment methods" ON payment_methods FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can view their own payouts" ON payouts;
CREATE POLICY "Vendors can view their own payouts" ON payouts FOR SELECT USING (
  EXISTS (SELECT 1 FROM vendors WHERE vendors.id = payouts.vendor_id AND vendors.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can view all payouts" ON payouts;
CREATE POLICY "Admins can view all payouts" ON payouts FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- =========================================================================
-- 038: vendor_views
-- =========================================================================

CREATE TABLE IF NOT EXISTS vendor_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_vendor_views_vendor_id ON vendor_views(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_views_user_id ON vendor_views(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_views_viewed_at ON vendor_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_views_source ON vendor_views(source);
CREATE INDEX IF NOT EXISTS idx_vendor_views_vendor_date ON vendor_views(vendor_id, viewed_at DESC);

ALTER TABLE vendor_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own views" ON vendor_views;
CREATE POLICY "Users can view their own views" ON vendor_views FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Anyone can track views" ON vendor_views;
CREATE POLICY "Anyone can track views" ON vendor_views FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION increment_vendor_view_count(vendor_id_param UUID) RETURNS void AS $$
BEGIN
  UPDATE vendors SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb), '{viewCount}',
    to_jsonb((COALESCE((stats->>'viewCount')::int, 0) + 1)::text)
  ) WHERE id = vendor_id_param;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION on_vendor_view_insert() RETURNS TRIGGER AS $$
BEGIN PERFORM increment_vendor_view_count(NEW.vendor_id); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_vendor_view_insert_trigger ON vendor_views;
CREATE TRIGGER on_vendor_view_insert_trigger AFTER INSERT ON vendor_views
  FOR EACH ROW EXECUTE FUNCTION on_vendor_view_insert();

ALTER TABLE users ADD COLUMN IF NOT EXISTS vendor_preferences JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_users_vendor_preferences ON users USING GIN (vendor_preferences);

-- =========================================================================
-- Reload PostgREST schema cache
-- =========================================================================
NOTIFY pgrst, 'reload schema';
