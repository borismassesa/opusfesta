-- Create vendor_reports table for reporting inappropriate or problematic vendor listings

CREATE TABLE IF NOT EXISTS vendor_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason VARCHAR(50) NOT NULL, -- 'spam', 'inappropriate', 'fraud', 'duplicate', 'wrong_info', 'other'
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_vendor_reports_vendor_id ON vendor_reports(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reports_reported_by ON vendor_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_vendor_reports_status ON vendor_reports(status);
CREATE INDEX IF NOT EXISTS idx_vendor_reports_created_at ON vendor_reports(created_at DESC);

-- Add comment
COMMENT ON TABLE vendor_reports IS 'Reports submitted by users about vendor listings';
COMMENT ON COLUMN vendor_reports.reason IS 'Reason for reporting: spam, inappropriate, fraud, duplicate, wrong_info, other';
COMMENT ON COLUMN vendor_reports.status IS 'Report status: pending, reviewed, resolved, dismissed';

-- RLS Policies
ALTER TABLE vendor_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create vendor reports" ON vendor_reports
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON vendor_reports
  FOR SELECT
  USING (auth.uid() = reported_by);

-- Admins can view all reports
CREATE POLICY "Admins can view all vendor reports" ON vendor_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update vendor reports" ON vendor_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
