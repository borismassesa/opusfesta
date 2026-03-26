-- Migration: couple_profiles table + onboarding_complete flag
-- Supports the mobile onboarding wizard for couples

-- 1) Add onboarding_complete flag to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT false;

-- 2) Create couple_profiles table
CREATE TABLE IF NOT EXISTS couple_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Names
  partner1_name VARCHAR(255) NOT NULL,
  partner2_name VARCHAR(255),

  -- Wedding details
  wedding_date DATE,
  date_undecided BOOLEAN NOT NULL DEFAULT false,
  budget_range VARCHAR(50), -- 'under_5m', '5m_15m', '15m_30m', '30m_50m', 'over_50m', 'undisclosed'
  guest_count INTEGER,

  -- Location
  city VARCHAR(100),
  region VARCHAR(100),

  -- Preferences
  preferred_categories TEXT[] DEFAULT '{}',

  -- Contact & media
  whatsapp_phone VARCHAR(50),
  avatar_url TEXT,

  -- Tracking
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_couple_profiles_user_id ON couple_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_city ON couple_profiles(city);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_complete ON users(onboarding_complete);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_couple_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER couple_profiles_updated_at
  BEFORE UPDATE ON couple_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_couple_profiles_updated_at();

-- 3) RLS Policies
ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile (requesting_user_id resolves Clerk JWT → Supabase UUID)
CREATE POLICY couple_profiles_select_own ON couple_profiles
  FOR SELECT USING (
    requesting_user_id() = user_id
    OR EXISTS (SELECT 1 FROM users WHERE id = requesting_user_id() AND role = 'admin')
  );

-- Users can insert their own profile
CREATE POLICY couple_profiles_insert_own ON couple_profiles
  FOR INSERT WITH CHECK (requesting_user_id() = user_id);

-- Users can update their own profile
CREATE POLICY couple_profiles_update_own ON couple_profiles
  FOR UPDATE USING (requesting_user_id() = user_id);
