-- Advice & Ideas content tables

CREATE TABLE IF NOT EXISTS advice_ideas_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  content text,
  image_url text,
  image_alt text,
  author_name text,
  author_avatar_url text,
  category text NOT NULL,
  read_time integer NOT NULL DEFAULT 5,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advice_ideas_posts_slug ON advice_ideas_posts (slug);
CREATE INDEX IF NOT EXISTS idx_advice_ideas_posts_category ON advice_ideas_posts (category);
CREATE INDEX IF NOT EXISTS idx_advice_ideas_posts_published_at ON advice_ideas_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_advice_ideas_posts_featured ON advice_ideas_posts (featured);
CREATE INDEX IF NOT EXISTS idx_advice_ideas_posts_published ON advice_ideas_posts (published);

CREATE TABLE IF NOT EXISTS advice_ideas_post_metrics (
  post_id uuid PRIMARY KEY REFERENCES advice_ideas_posts(id) ON DELETE CASCADE,
  views bigint NOT NULL DEFAULT 0,
  saves bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advice_ideas_post_metrics_views ON advice_ideas_post_metrics (views DESC);
CREATE INDEX IF NOT EXISTS idx_advice_ideas_post_metrics_saves ON advice_ideas_post_metrics (saves DESC);

CREATE TABLE IF NOT EXISTS advice_ideas_newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advice_ideas_newsletter_status ON advice_ideas_newsletter_subscribers (status);

-- updated_at triggers
DROP TRIGGER IF EXISTS update_advice_ideas_posts_updated_at ON advice_ideas_posts;
CREATE TRIGGER update_advice_ideas_posts_updated_at BEFORE UPDATE ON advice_ideas_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_advice_ideas_post_metrics_updated_at ON advice_ideas_post_metrics;
CREATE TRIGGER update_advice_ideas_post_metrics_updated_at BEFORE UPDATE ON advice_ideas_post_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_advice_ideas_newsletter_updated_at ON advice_ideas_newsletter_subscribers;
CREATE TRIGGER update_advice_ideas_newsletter_updated_at BEFORE UPDATE ON advice_ideas_newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure metrics row exists for each post
CREATE OR REPLACE FUNCTION create_advice_ideas_post_metrics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO advice_ideas_post_metrics (post_id)
  VALUES (NEW.id)
  ON CONFLICT (post_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_advice_ideas_post_metrics ON advice_ideas_posts;
CREATE TRIGGER create_advice_ideas_post_metrics
AFTER INSERT ON advice_ideas_posts
FOR EACH ROW EXECUTE FUNCTION create_advice_ideas_post_metrics();

-- Increment views helper
CREATE OR REPLACE FUNCTION increment_advice_ideas_post_view(post_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  SELECT id INTO target_id
  FROM advice_ideas_posts
  WHERE slug = post_slug
    AND published = true
  LIMIT 1;

  IF target_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE advice_ideas_post_metrics
  SET views = views + 1
  WHERE post_id = target_id;
END;
$$;

-- RLS
ALTER TABLE advice_ideas_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_ideas_posts FORCE ROW LEVEL SECURITY;
ALTER TABLE advice_ideas_post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_ideas_post_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE advice_ideas_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_ideas_newsletter_subscribers FORCE ROW LEVEL SECURITY;

-- Public read for published posts
DROP POLICY IF EXISTS "public read published advice ideas posts" ON advice_ideas_posts;
CREATE POLICY "public read published advice ideas posts" ON advice_ideas_posts
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- Staff write access
DROP POLICY IF EXISTS "staff write advice ideas posts" ON advice_ideas_posts;
CREATE POLICY "staff write advice ideas posts" ON advice_ideas_posts
  FOR ALL TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor'))
  WITH CHECK (cms_role() IN ('owner', 'admin', 'editor'));

-- Metrics are readable publicly for sorting
DROP POLICY IF EXISTS "public read advice ideas metrics" ON advice_ideas_post_metrics;
CREATE POLICY "public read advice ideas metrics" ON advice_ideas_post_metrics
  FOR SELECT TO anon, authenticated
  USING (true);

-- Newsletter subscribers: staff only
DROP POLICY IF EXISTS "staff read newsletter subscribers" ON advice_ideas_newsletter_subscribers;
CREATE POLICY "staff read newsletter subscribers" ON advice_ideas_newsletter_subscribers
  FOR SELECT TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "staff write newsletter subscribers" ON advice_ideas_newsletter_subscribers;
CREATE POLICY "staff write newsletter subscribers" ON advice_ideas_newsletter_subscribers
  FOR ALL TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor'))
  WITH CHECK (cms_role() IN ('owner', 'admin', 'editor'));
