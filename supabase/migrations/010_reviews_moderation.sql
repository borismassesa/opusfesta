-- Reviews Moderation and Booking Verification
-- Adds moderation workflow and booking verification to reviews

-- Add moderation status enum
CREATE TYPE review_moderation_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- Add new columns to reviews table
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderation_status review_moderation_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS flagged_reason TEXT;

-- Create index for moderation queries
CREATE INDEX IF NOT EXISTS idx_reviews_moderation_status ON reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_reviews_inquiry_id ON reviews(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pending_moderation ON reviews(moderation_status) WHERE moderation_status = 'pending';

-- Update RLS policies for moderation
-- Only show approved reviews to public (or user's own reviews)
DROP POLICY IF EXISTS "Anyone can view verified reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT
  USING (
    moderation_status = 'approved' 
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = reviews.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Admins can view all reviews including pending/flagged
CREATE POLICY "Admins can view all reviews" ON reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to verify if user can review a vendor (must have completed inquiry)
CREATE OR REPLACE FUNCTION can_user_review_vendor(
  user_uuid UUID,
  vendor_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  has_completed_inquiry BOOLEAN;
BEGIN
  -- Check if user has a completed/accepted inquiry for this vendor
  SELECT EXISTS (
    SELECT 1
    FROM inquiries
    WHERE inquiries.user_id = user_uuid
      AND inquiries.vendor_id = vendor_uuid
      AND inquiries.status IN ('accepted', 'responded')
      AND inquiries.event_date IS NOT NULL
      AND inquiries.event_date <= CURRENT_DATE  -- Event must have passed
  ) INTO has_completed_inquiry;
  
  RETURN has_completed_inquiry;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to approve a review
CREATE OR REPLACE FUNCTION approve_review(
  review_uuid UUID,
  moderator_uuid UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews
  SET moderation_status = 'approved',
      verified = true,
      moderated_at = CURRENT_TIMESTAMP,
      moderated_by = moderator_uuid
  WHERE id = review_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to reject a review
CREATE OR REPLACE FUNCTION reject_review(
  review_uuid UUID,
  moderator_uuid UUID,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews
  SET moderation_status = 'rejected',
      moderation_notes = rejection_reason,
      moderated_at = CURRENT_TIMESTAMP,
      moderated_by = moderator_uuid
  WHERE id = review_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to flag a review for review
CREATE OR REPLACE FUNCTION flag_review(
  review_uuid UUID,
  flag_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE reviews
  SET moderation_status = 'flagged',
      flagged_reason = flag_reason,
      moderated_at = CURRENT_TIMESTAMP
  WHERE id = review_uuid;
END;
$$ LANGUAGE plpgsql;

-- Update the review creation policy to check for booking verification
-- Users can only create reviews if they have a completed inquiry
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND can_user_review_vendor(auth.uid(), vendor_id)
    AND NOT EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.user_id = auth.uid()
        AND reviews.vendor_id = vendor_id
    )
  );

-- Admins can moderate reviews
CREATE POLICY "Admins can moderate reviews" ON reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Auto-verify reviews from users with completed bookings (optional - can be manual moderation)
-- This is a helper function, moderation can still be manual
CREATE OR REPLACE FUNCTION auto_verify_review_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If review is linked to an inquiry and inquiry is accepted, auto-approve
  -- Otherwise, leave as pending for manual moderation
  IF NEW.inquiry_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = NEW.inquiry_id
        AND inquiries.status IN ('accepted', 'responded')
    ) THEN
      -- Auto-approve if inquiry is completed
      NEW.moderation_status := 'approved';
      NEW.verified := true;
    ELSE
      -- Leave as pending for manual review
      NEW.moderation_status := 'pending';
      NEW.verified := false;
    END IF;
  ELSE
    -- No inquiry linked, requires manual moderation
    NEW.moderation_status := 'pending';
    NEW.verified := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-verify reviews on insert
DROP TRIGGER IF EXISTS auto_verify_review_insert ON reviews;
CREATE TRIGGER auto_verify_review_insert
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION auto_verify_review_on_insert();


-- Update vendor rating stats function to only count approved reviews
CREATE OR REPLACE FUNCTION update_vendor_rating_stats()
RETURNS TRIGGER AS $$
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
      SELECT COUNT(*)
      FROM reviews
      WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
        AND moderation_status = 'approved'
    ))
  )
  WHERE id = COALESCE(NEW.vendor_id, OLD.vendor_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
