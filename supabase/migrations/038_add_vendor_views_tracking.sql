-- Migration: Add vendor views tracking for analytics and progressive disclosure
-- This enables tracking of vendor profile views (both authenticated and anonymous)

-- Vendor Views Table
CREATE TABLE IF NOT EXISTS vendor_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous views
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  source TEXT, -- 'listing', 'search', 'recommendation', 'saved', etc.
  session_id TEXT, -- For anonymous tracking
  ip_address INET, -- For anonymous tracking (optional, consider privacy)
  
  -- Metadata
  user_agent TEXT,
  referrer TEXT
);

-- Create indexes for vendor views
CREATE INDEX idx_vendor_views_vendor_id ON vendor_views(vendor_id);
CREATE INDEX idx_vendor_views_user_id ON vendor_views(user_id);
CREATE INDEX idx_vendor_views_viewed_at ON vendor_views(viewed_at DESC);
CREATE INDEX idx_vendor_views_source ON vendor_views(source);

-- Composite index for analytics queries
CREATE INDEX idx_vendor_views_vendor_date ON vendor_views(vendor_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE vendor_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_views
-- Users can view their own views
CREATE POLICY "Users can view their own views" ON vendor_views
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Anyone can insert views (for anonymous tracking)
CREATE POLICY "Anyone can track views" ON vendor_views
  FOR INSERT
  WITH CHECK (true);

-- Function to increment vendor view count
CREATE OR REPLACE FUNCTION increment_vendor_view_count(vendor_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE vendors
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    '{viewCount}',
    to_jsonb((COALESCE((stats->>'viewCount')::int, 0) + 1)::text)
  )
  WHERE id = vendor_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-increment view count
CREATE OR REPLACE FUNCTION on_vendor_view_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment view count
  PERFORM increment_vendor_view_count(NEW.vendor_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vendor_view_insert_trigger
  AFTER INSERT ON vendor_views
  FOR EACH ROW
  EXECUTE FUNCTION on_vendor_view_insert();

-- Add vendor_preferences column to users table for recommendations
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS vendor_preferences JSONB DEFAULT '{}'::jsonb;

-- Create index for vendor preferences
CREATE INDEX IF NOT EXISTS idx_users_vendor_preferences ON users USING GIN (vendor_preferences);

-- Comments
COMMENT ON TABLE vendor_views IS 'Tracks vendor profile views for analytics and progressive disclosure';
COMMENT ON COLUMN vendor_views.user_id IS 'NULL for anonymous views, UUID for authenticated users';
COMMENT ON COLUMN vendor_views.source IS 'Source of the view: listing, search, recommendation, saved, etc.';
COMMENT ON COLUMN vendor_views.session_id IS 'Session identifier for anonymous user tracking';
COMMENT ON FUNCTION increment_vendor_view_count IS 'Atomically increment vendor view count in stats';
COMMENT ON COLUMN users.vendor_preferences IS 'User preferences for vendor recommendations: { event_types: [], budget_min: 0, budget_max: 0, style: [], locations: [] }';
