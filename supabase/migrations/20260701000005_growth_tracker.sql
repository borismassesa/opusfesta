-- Growth Tracker — replaces the manual "OPUS_FESTA_VENDOR'S _TRACKER_2026.xlsx"
-- company-wide growth spreadsheet: Vendor Outreach (every employee owns a
-- monthly vendor-acquisition target), Sales & Marketing (KPIs + campaign
-- log), Social Media (KPIs + content log + bi-weekly challenge schedule),
-- Studio Performance (KPIs + booking log), and a Content Ideas reference
-- bank. A Monthly Dashboard roll-up reads the KPI tables directly — it has
-- no table of its own.
--
-- Backs: /growth, /growth/vendor-outreach, /growth/marketing, /growth/social,
--        /growth/studio, /growth/content-ideas
--
-- Person fields (staff_name, owner_name, posted_by_name, ...) are free text,
-- not employee_id FKs — the sheet's staff roster (Edith Kibavu, "Marketing
-- Person 3", "Studio Lead", ...) is an aspirational hiring plan that doesn't
-- match today's real workforce_employees rows. Free text matches the sheet's
-- own fixed-dropdown behavior without forcing premature HR data entry.
--
-- Access model mirrors the rest of the workforce module: service role
-- (admin app) bypasses RLS and enforces authz in server actions —
-- growth.write to log entries, growth.admin to edit targets/roster/
-- challenge definitions/content-ideas bank. RLS below is belt-and-braces,
-- same shape as 20260701000004_md_daily_tracker.sql.

-- =============================================================================
-- Shared KPI framework — backs Marketing / Social / Studio tabs + the
-- dashboard roll-up. One target per (category, kpi_key); one actual per
-- (kpi_target_id, month).
-- =============================================================================

CREATE TABLE IF NOT EXISTS growth_kpi_targets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category text NOT NULL CHECK (category IN ('vendor_outreach', 'sales_marketing', 'social_media', 'studio')),
  kpi_key text NOT NULL,
  label text NOT NULL CHECK (length(btrim(label)) > 0),
  unit text NOT NULL DEFAULT 'count', -- 'count' | 'tzs' | 'percent' | 'rating' | 'days'
  monthly_target numeric NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category, kpi_key)
);

CREATE TABLE IF NOT EXISTS growth_kpi_actuals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_target_id uuid NOT NULL REFERENCES growth_kpi_targets(id) ON DELETE CASCADE,
  month date NOT NULL, -- always the 1st of the month
  actual numeric,
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kpi_target_id, month)
);

CREATE INDEX IF NOT EXISTS idx_growth_kpi_actuals_target_month
  ON growth_kpi_actuals (kpi_target_id, month DESC);

-- =============================================================================
-- Vendor Outreach
-- =============================================================================

CREATE TABLE IF NOT EXISTS growth_vendor_outreach_targets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_name text NOT NULL,
  department text NOT NULL DEFAULT '',
  target_outreach int NOT NULL DEFAULT 0,
  target_meetings int NOT NULL DEFAULT 0,
  target_signed int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One row per vendor contact. Roster "Done" counts are computed live from
-- this table (grouped by staff_name + month) rather than re-entered by
-- hand like the sheet's Done columns — avoids the two ever drifting apart.
CREATE TABLE IF NOT EXISTS growth_vendor_outreach_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  staff_name text NOT NULL,
  vendor_name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  contact_method text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT '1. Initial Contact',
  next_action text NOT NULL DEFAULT '',
  next_action_date date,
  travel_cost_tzs numeric,
  outcome text NOT NULL DEFAULT 'Active — In Funnel',
  notes text NOT NULL DEFAULT '',
  created_by_employee_id uuid REFERENCES workforce_employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_vendor_outreach_log_date
  ON growth_vendor_outreach_log (log_date DESC);
CREATE INDEX IF NOT EXISTS idx_growth_vendor_outreach_log_staff
  ON growth_vendor_outreach_log (staff_name, log_date DESC);

-- =============================================================================
-- Sales & Marketing
-- =============================================================================

CREATE TABLE IF NOT EXISTS growth_marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  campaign_name text NOT NULL DEFAULT '',
  channel text NOT NULL DEFAULT '',
  owner_name text NOT NULL DEFAULT '',
  spend_tzs numeric NOT NULL DEFAULT 0,
  reach int NOT NULL DEFAULT 0,
  leads int NOT NULL DEFAULT 0,
  bookings int NOT NULL DEFAULT 0,
  revenue_tzs numeric NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_marketing_campaigns_start
  ON growth_marketing_campaigns (start_date DESC);

-- =============================================================================
-- Social Media
-- =============================================================================

CREATE TABLE IF NOT EXISTS growth_social_content_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_date date NOT NULL DEFAULT CURRENT_DATE,
  channel text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT '',
  topic text NOT NULL DEFAULT '',
  posted_by_name text NOT NULL DEFAULT '',
  likes int NOT NULL DEFAULT 0,
  comments int NOT NULL DEFAULT 0,
  shares int NOT NULL DEFAULT 0,
  saves int NOT NULL DEFAULT 0,
  reach int NOT NULL DEFAULT 0,
  new_followers int NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_social_content_log_date
  ON growth_social_content_log (post_date DESC);

CREATE TABLE IF NOT EXISTS growth_social_challenges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_date date NOT NULL,
  theme text NOT NULL DEFAULT '',
  lead_channel text NOT NULL DEFAULT '',
  hashtag text NOT NULL DEFAULT '',
  lead_owner_name text NOT NULL DEFAULT '',
  posts_made int,
  total_reach int,
  total_engagements int,
  new_followers int,
  submissions_ugc int,
  result text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_social_challenges_date
  ON growth_social_challenges (launch_date);

-- =============================================================================
-- Studio Performance — named growth_studio_bookings_log (not studio_bookings,
-- which already exists as the client-facing inquiry table).
-- =============================================================================

CREATE TABLE IF NOT EXISTS growth_studio_bookings_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_date date NOT NULL DEFAULT CURRENT_DATE,
  session_date date,
  customer_name text NOT NULL DEFAULT '',
  service text NOT NULL DEFAULT '',
  photographer_name text NOT NULL DEFAULT '',
  videographer_name text NOT NULL DEFAULT '',
  revenue_tzs numeric NOT NULL DEFAULT 0,
  direct_cost_tzs numeric NOT NULL DEFAULT 0,
  delivery_date date,
  satisfaction numeric,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_studio_bookings_log_date
  ON growth_studio_bookings_log (booking_date DESC);

-- =============================================================================
-- Content Ideas bank — reference library the Social tab's challenge
-- schedule draws from.
-- =============================================================================

CREATE TABLE IF NOT EXISTS growth_content_ideas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind text NOT NULL CHECK (kind IN ('tiktok_challenge', 'office_challenge', 'content_series', 'hashtag')),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}', -- kind-specific extra fields, see header comment
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_content_ideas_kind
  ON growth_content_ideas (kind, sort_order);

-- =============================================================================
-- updated_at triggers
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'growth_kpi_targets', 'growth_kpi_actuals',
    'growth_vendor_outreach_targets', 'growth_vendor_outreach_log',
    'growth_marketing_campaigns',
    'growth_social_content_log', 'growth_social_challenges',
    'growth_studio_bookings_log',
    'growth_content_ideas'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON %1$s;
       CREATE TRIGGER trg_%1$s_updated_at
         BEFORE UPDATE ON %1$s
         FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t
    );
  END LOOP;
END $$;

-- =============================================================================
-- RLS — admin-only, same shape as the rest of the module
-- =============================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'growth_kpi_targets', 'growth_kpi_actuals',
    'growth_vendor_outreach_targets', 'growth_vendor_outreach_log',
    'growth_marketing_campaigns',
    'growth_social_content_log', 'growth_social_challenges',
    'growth_studio_bookings_log',
    'growth_content_ideas'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'DROP POLICY IF EXISTS "%1$s_read" ON %1$s;
       CREATE POLICY "%1$s_read" ON %1$s FOR SELECT TO authenticated
       USING (is_workforce_reader());', t
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS "%1$s_write" ON %1$s;
       CREATE POLICY "%1$s_write" ON %1$s FOR ALL TO authenticated
       USING (is_workforce_admin()) WITH CHECK (is_workforce_admin());', t
    );
  END LOOP;
END $$;

-- =============================================================================
-- Seed: Vendor Outreach roster (9 rows, from the sheet)
-- =============================================================================

INSERT INTO growth_vendor_outreach_targets (staff_name, department, target_outreach, target_meetings, target_signed, sort_order)
VALUES
  ('Edith Kibavu', 'Marketing', 25, 14, 8, 1),
  ('Varsity Johaness', 'Marketing', 25, 14, 8, 2),
  ('Marketing Person 3', 'Marketing', 25, 14, 8, 3),
  ('Wedding Planner 1', 'Wedding Planning', 15, 8, 5, 4),
  ('Wedding Planner 2', 'Wedding Planning', 15, 8, 5, 5),
  ('Studio Lead', 'Studio', 15, 8, 5, 6),
  ('Studio Asst', 'Studio', 15, 8, 5, 7),
  ('Finance', 'Finance', 15, 8, 5, 8),
  ('CEO', 'Executive', 15, 8, 5, 9)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Seed: KPI targets — Sales & Marketing (7), Social Media (10), Studio (10)
-- =============================================================================

INSERT INTO growth_kpi_targets (category, kpi_key, label, unit, monthly_target, sort_order)
VALUES
  -- Sales & Marketing
  ('sales_marketing', 'inbound_leads', 'Inbound Leads', 'count', 25, 1),
  ('sales_marketing', 'qualified_leads', 'Qualified Leads', 'count', 15, 2),
  ('sales_marketing', 'bookings_from_marketing', 'Bookings From Marketing', 'count', 8, 3),
  ('sales_marketing', 'cost_per_lead', 'Cost Per Lead (TZS)', 'tzs', 15000, 4),
  ('sales_marketing', 'cost_per_acquisition', 'Cost Per Acquisition (TZS)', 'tzs', 50000, 5),
  ('sales_marketing', 'marketing_spend', 'Marketing Spend (TZS)', 'tzs', 1810000, 6),
  ('sales_marketing', 'revenue_attributed', 'Revenue Attributed (TZS)', 'tzs', 0, 7),
  -- Social Media
  ('social_media', 'posts_published', 'Posts Published (combined)', 'count', 16, 1),
  ('social_media', 'reels_videos', 'Reels / TikTok Videos', 'count', 6, 2),
  ('social_media', 'stories_posted', 'Stories Posted', 'count', 30, 3),
  ('social_media', 'net_new_followers', 'Net New Followers (combined)', 'count', 500, 4),
  ('social_media', 'total_reach', 'Total Reach', 'count', 20000, 5),
  ('social_media', 'total_engagements', 'Total Engagements (likes+comments+shares)', 'count', 1000, 6),
  ('social_media', 'engagement_rate', 'Engagement Rate %', 'percent', 0.04, 7),
  ('social_media', 'dm_enquiries', 'DM Enquiries Received', 'count', 8, 8),
  ('social_media', 'saves_on_posts', 'Saves on Posts', 'count', 80, 9),
  ('social_media', 'profile_visits', 'Profile Visits', 'count', 2000, 10),
  -- Studio
  ('studio', 'total_bookings', 'Total Bookings (sessions)', 'count', 12, 1),
  ('studio', 'total_studio_revenue', 'Total Studio Revenue (TZS)', 'tzs', 6650000, 2),
  ('studio', 'avg_booking_value', 'Average Booking Value (TZS)', 'tzs', 554000, 3),
  ('studio', 'equipment_utilisation', 'Equipment Utilisation %', 'percent', 0.55, 4),
  ('studio', 'customer_satisfaction', 'Customer Satisfaction', 'rating', 4.5, 5),
  ('studio', 'photo_delivery_days', 'Photo Delivery — Avg Days', 'days', 5, 6),
  ('studio', 'video_delivery_days', 'Video Delivery — Avg Days', 'days', 14, 7),
  ('studio', 'repeat_customer_rate', 'Repeat Customer Rate %', 'percent', 0.20, 8),
  ('studio', 'direct_costs', 'Direct Costs (TZS)', 'tzs', 250000, 9),
  ('studio', 'gross_margin', 'Gross Margin %', 'percent', 0.78, 10)
ON CONFLICT (category, kpi_key) DO NOTHING;

-- =============================================================================
-- Seed: Bi-weekly challenge schedule (14 rows, Jun–Nov 2026)
-- =============================================================================

INSERT INTO growth_social_challenges (launch_date, theme, lead_channel, hashtag)
VALUES
  ('2026-06-01', 'Studio Glow-Up TikTok (couples re-create engagement photos)', 'TikTok + IG Reels', '#OpusFestaStudio'),
  ('2026-06-15', 'Office Olympics (staff compete — wedding-themed games)', 'TikTok + IG Reels', '#OpusFestaOffice'),
  ('2026-06-29', 'Vendor Spotlight Week (1 vendor / day all week)', 'TikTok + IG Reels', '#OpusFestaVendor'),
  ('2026-07-13', 'Behind-The-Wedding Series (real setup time-lapses)', 'TikTok + IG Reels', '#OpusFestaBehind-The-Wedding'),
  ('2026-07-27', 'Real Bride Confessions (relatable bride-stress reels)', 'TikTok + IG Reels', '#OpusFestaReal'),
  ('2026-08-10', 'Wedding Hack Wednesdays (4 quick-tip reels)', 'TikTok + IG Reels', '#OpusFestaWedding'),
  ('2026-08-24', 'Studio Open Day — Live Tour', 'TikTok + IG Reels', '#OpusFestaStudio'),
  ('2026-09-07', '365 Days Until Their Wedding (couple countdown)', 'TikTok + IG Reels', '#OpusFesta365'),
  ('2026-09-21', 'Outfit Repeat Challenge (groomsmen vs bridesmaids)', 'TikTok + IG Reels', '#OpusFestaOutfit'),
  ('2026-10-05', 'Glow-Down to Glow-Up (bridal prep transformations)', 'TikTok + IG Reels', '#OpusFestaGlow-Down'),
  ('2026-10-19', 'Real Bride Q&A Live (recurring)', 'TikTok + IG Reels', '#OpusFestaReal'),
  ('2026-11-02', 'Vendor''s Day Off (vendors share hobbies)', 'TikTok + IG Reels', '#OpusFestaVendor''s'),
  ('2026-11-16', 'Wedding Trend 2026 — Predictions Reel', 'TikTok + IG Reels', '#OpusFestaWedding'),
  ('2026-11-30', 'Year-End Highlight Reel (best of 2026)', 'TikTok + IG Reels', '#OpusFestaYear-End')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Seed: Content Ideas bank
-- =============================================================================

INSERT INTO growth_content_ideas (kind, title, description, details, sort_order)
VALUES
  -- 1. TikTok / Reels challenges (20)
  ('tiktok_challenge', 'The Vendor Tag Challenge', 'Tag a vendor in 3 frames + caption with their signature service.', '{"channel":"TikTok + IG Reels","best_for":"Vendor visibility","difficulty":"Easy"}', 1),
  ('tiktok_challenge', 'Studio Glow-Up Reveal', '15-sec before/after of the studio set up for a shoot. Trending audio + transition.', '{"channel":"TikTok + IG","best_for":"Studio engagement","difficulty":"Easy"}', 2),
  ('tiktok_challenge', 'Office Olympics', 'Wedding-themed silly games among staff. Filmed as a series.', '{"channel":"TikTok + IG Reels","best_for":"Brand personality","difficulty":"Medium"}', 3),
  ('tiktok_challenge', 'Real Bride Confessions', 'Anonymous brides share funny / stressful planning moments. Voiceover + b-roll.', '{"channel":"TikTok + IG","best_for":"Bride community","difficulty":"Medium"}', 4),
  ('tiktok_challenge', 'Behind-The-Wedding', 'Time-lapse of a wedding setup. Show the team''s craft.', '{"channel":"Instagram + TikTok","best_for":"Service quality","difficulty":"Medium"}', 5),
  ('tiktok_challenge', 'Wedding Hack Wednesdays', '60-sec actionable tip every Wednesday — 4 reels/month.', '{"channel":"IG Reels + TikTok","best_for":"Bride education","difficulty":"Easy"}', 6),
  ('tiktok_challenge', 'Vendor''s Day Off', 'Vendor shares their hobby. Humanises the platform.', '{"channel":"Instagram + LinkedIn","best_for":"Vendor relationship","difficulty":"Easy"}', 7),
  ('tiktok_challenge', '365 Days Until Their Wedding', 'Follow a couple''s planning journey for a year — episodic.', '{"channel":"TikTok + IG + YouTube","best_for":"Long-form storytelling","difficulty":"Hard"}', 8),
  ('tiktok_challenge', 'Outfit Repeat Challenge', 'Groomsmen vs bridesmaids — who repeats outfits less. Funny lens.', '{"channel":"TikTok","best_for":"Light brand humour","difficulty":"Easy"}', 9),
  ('tiktok_challenge', 'Glow-Down to Glow-Up', 'Bridal prep in 60 seconds — morning chaos to the aisle.', '{"channel":"IG Reels + TikTok","best_for":"Bridal aspiration","difficulty":"Medium"}', 10),
  ('tiktok_challenge', 'Photographer''s Eye', 'POV of the photographer — what they see vs the final photo.', '{"channel":"Instagram + TikTok","best_for":"Studio craft","difficulty":"Medium"}', 11),
  ('tiktok_challenge', 'Wedding Trend Predictions 2026', 'What''s going to be HUGE in TZ weddings. Data + opinion.', '{"channel":"Instagram + LinkedIn","best_for":"Thought leadership","difficulty":"Hard"}', 12),
  ('tiktok_challenge', 'Wedding Cost Reveal', 'Honest breakdown of a real wedding budget — controversial = engagement.', '{"channel":"TikTok + IG","best_for":"Bride awareness","difficulty":"Medium"}', 13),
  ('tiktok_challenge', 'Lost & Found at the Wedding', 'Funny series — weird things found after weddings.', '{"channel":"TikTok","best_for":"Humour","difficulty":"Easy"}', 14),
  ('tiktok_challenge', 'Vendor of the Week', 'Spotlight one vendor every Monday — they share, drives traffic.', '{"channel":"All channels","best_for":"Vendor partnership","difficulty":"Easy"}', 15),
  -- 2. Internal office challenges (8)
  ('office_challenge', 'Vendor Race Friday', 'Whoever signs up the most vendors that week is celebrated (and treated). Builds positive recognition.', '{"frequency":"Weekly","content_output":"Reel of the winner","reward":"Lunch from team"}', 1),
  ('office_challenge', 'Customer Compliment Wall', 'Print every nice customer message + put on the wall. Photo for IG.', '{"frequency":"Ongoing","content_output":"Stories + Posts","reward":"Visibility"}', 2),
  ('office_challenge', 'Office Wedding Roleplay', 'Staff play a wedding party — bride, groom, MC. Studio photo session.', '{"frequency":"Monthly","content_output":"Reel + Photo","reward":"Branded merch"}', 3),
  ('office_challenge', 'Best Vendor Story', 'Each staff shares their best vendor interaction at Monday standup. Best becomes content.', '{"frequency":"Weekly","content_output":"Storyboard for Reel","reward":"Coffee from CEO"}', 4),
  ('office_challenge', 'Hashtag Sprint', 'Brainstorm 20 hashtag combos in 10 min. Best one used in next campaign.', '{"frequency":"Monthly","content_output":"Reusable in content","reward":"Public recognition"}', 5),
  ('office_challenge', 'New Idea Tuesday', 'Each member pitches one content idea every Tuesday. Best one gets made.', '{"frequency":"Weekly","content_output":"Implemented content","reward":"Idea credit on post"}', 6),
  ('office_challenge', 'Spot the Bride', 'Identify the next celebrity TZ bride before announcement. First to alert the team wins.', '{"frequency":"Whenever","content_output":"Newsjacking content","reward":"TBC"}', 7),
  ('office_challenge', 'Tag Your Vendor', 'Each staff personally tags 5 friends/family vendors per week. Most replies wins.', '{"frequency":"Weekly","content_output":"Outreach + UGC","reward":"Team gathering"}', 8),
  -- 3. Recurring content series (8)
  ('content_series', 'Wedding Hack Wednesday', '60-sec tip every Wednesday', '{"cadence":"Weekly","channel":"IG Reels + TikTok","owner":"Marketing"}', 1),
  ('content_series', 'Vendor Spotlight Monday', 'Feature one vendor every Monday', '{"cadence":"Weekly","channel":"Instagram","owner":"Marketing"}', 2),
  ('content_series', 'Behind-The-Bride Stories', 'Long-form story of a real bride''s journey', '{"cadence":"Bi-weekly","channel":"IG Stories + Reels","owner":"Wedding Planner"}', 3),
  ('content_series', 'Studio Saturday', 'What happened in the studio this week', '{"cadence":"Weekly","channel":"Instagram + TikTok","owner":"Studio Lead"}', 4),
  ('content_series', 'Real Bride Q&A Live', 'Monthly IG Live answering bride questions', '{"cadence":"Monthly","channel":"IG Live","owner":"Marketing"}', 5),
  ('content_series', 'Office Diaries', 'Day-in-the-life content from staff', '{"cadence":"Weekly","channel":"TikTok + IG Reels","owner":"Rotating staff"}', 6),
  ('content_series', 'Wedding Trend Friday', 'What''s hot in TZ weddings this week', '{"cadence":"Weekly","channel":"Instagram","owner":"Marketing"}', 7),
  ('content_series', 'Couple''s First Look Reels', 'Reaction footage from couples — emotional content', '{"cadence":"When available","channel":"All channels","owner":"Studio"}', 8),
  -- 4. Hashtag library (6)
  ('hashtag', 'Brand', '', '{"hashtags":"#OpusFesta #OpusFestaWedding #PlanLessCelebrateMore","notes":"Always include"}', 1),
  ('hashtag', 'Tanzanian Wedding', '', '{"hashtags":"#TanzanianWedding #BongoBride #DarWedding #ArushaWedding #ZanzibarWedding","notes":"Geo-targeted reach"}', 2),
  ('hashtag', 'Photography', '', '{"hashtags":"#TZWeddingPhotography #DarPhotographer #BongoWeddingPhotos","notes":"Studio-specific"}', 3),
  ('hashtag', 'General Bridal', '', '{"hashtags":"#BrideToBe2026 #WeddingPlanning2026 #BongoBride","notes":"Aspirational"}', 4),
  ('hashtag', 'Vendor', '', '{"hashtags":"#TZWeddingVendors #BongoVendors #SupportLocalTZ","notes":"Vendor community"}', 5),
  ('hashtag', 'Studio', '', '{"hashtags":"#OpusFestaStudio #DarStudio #PodcastStudioTZ #ContentCreatorTZ","notes":"Studio rental"}', 6)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE growth_kpi_targets IS 'Growth Tracker — monthly KPI targets for Sales & Marketing / Social Media / Studio. RLS: admin-only; growth.admin edits via server action.';
COMMENT ON TABLE growth_kpi_actuals IS 'Growth Tracker — monthly actual value per KPI target. RLS: admin-only; growth.write edits via server action.';
COMMENT ON TABLE growth_vendor_outreach_targets IS 'Growth Tracker — per-staff monthly vendor-acquisition targets (roster). RLS: admin-only; growth.admin edits.';
COMMENT ON TABLE growth_vendor_outreach_log IS 'Growth Tracker — one row per vendor contact; roster Done counts computed from this table. RLS: admin-only; growth.write edits.';
COMMENT ON TABLE growth_marketing_campaigns IS 'Growth Tracker — marketing campaign log with computed ROI. RLS: admin-only; growth.write edits.';
COMMENT ON TABLE growth_social_content_log IS 'Growth Tracker — one row per social post. RLS: admin-only; growth.write edits.';
COMMENT ON TABLE growth_social_challenges IS 'Growth Tracker — bi-weekly TikTok/Reels challenge schedule. RLS: admin-only; growth.admin defines, growth.write fills in results.';
COMMENT ON TABLE growth_studio_bookings_log IS 'Growth Tracker — studio booking log with computed margin. Not to be confused with studio_bookings (client-facing inquiries). RLS: admin-only; growth.write edits.';
COMMENT ON TABLE growth_content_ideas IS 'Growth Tracker — content ideas reference bank (TikTok challenges, office challenges, content series, hashtags). RLS: admin-only; growth.admin edits.';

NOTIFY pgrst, 'reload schema';
