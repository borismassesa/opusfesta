-- Advice & Ideas contributor workflow
-- External writers work in staging submissions; admins approve into
-- advice_ideas_posts so unpublished contributor drafts never appear publicly.

CREATE TABLE IF NOT EXISTS advice_article_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  full_name text,
  article_title text,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  created_by_clerk_id text,
  accepted_clerk_id text,
  accepted_submission_id uuid,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advice_article_invitations_email
  ON advice_article_invitations (lower(email));
CREATE INDEX IF NOT EXISTS idx_advice_article_invitations_status
  ON advice_article_invitations (status);
CREATE INDEX IF NOT EXISTS idx_advice_article_invitations_expires_at
  ON advice_article_invitations (expires_at);

CREATE TABLE IF NOT EXISTS advice_article_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id uuid REFERENCES advice_article_invitations(id) ON DELETE SET NULL,
  author_email text NOT NULL,
  author_clerk_id text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'changes_requested', 'approved', 'rejected', 'published')),
  admin_notes text,
  correction_notes text,
  source_post_id uuid REFERENCES advice_ideas_posts(id) ON DELETE SET NULL,

  slug text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Planning Guides',
  section_id text NOT NULL DEFAULT 'planning-guides',
  author_name text,
  author_role text,
  author_avatar_url text,
  read_time integer NOT NULL DEFAULT 5,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  hero_media_type text NOT NULL DEFAULT 'image'
    CHECK (hero_media_type IN ('image', 'video')),
  hero_media_src text NOT NULL DEFAULT '',
  hero_media_alt text NOT NULL DEFAULT '',
  hero_media_poster text,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  seed_comments jsonb NOT NULL DEFAULT '[]'::jsonb,

  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_clerk_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE advice_article_invitations
  ADD CONSTRAINT advice_article_invitations_submission_fk
  FOREIGN KEY (accepted_submission_id)
  REFERENCES advice_article_submissions(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS idx_advice_article_submissions_author
  ON advice_article_submissions (author_clerk_id, status);
CREATE INDEX IF NOT EXISTS idx_advice_article_submissions_author_email
  ON advice_article_submissions (lower(author_email));
CREATE INDEX IF NOT EXISTS idx_advice_article_submissions_status
  ON advice_article_submissions (status);
CREATE INDEX IF NOT EXISTS idx_advice_article_submissions_submitted_at
  ON advice_article_submissions (submitted_at DESC);

DROP TRIGGER IF EXISTS update_advice_article_invitations_updated_at
  ON advice_article_invitations;
CREATE TRIGGER update_advice_article_invitations_updated_at
  BEFORE UPDATE ON advice_article_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_advice_article_submissions_updated_at
  ON advice_article_submissions;
CREATE TRIGGER update_advice_article_submissions_updated_at
  BEFORE UPDATE ON advice_article_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE advice_article_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_article_invitations FORCE ROW LEVEL SECURITY;
ALTER TABLE advice_article_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_article_submissions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role full access article invitations"
  ON advice_article_invitations;
CREATE POLICY "service role full access article invitations"
  ON advice_article_invitations
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "admins manage article invitations"
  ON advice_article_invitations;
CREATE POLICY "admins manage article invitations"
  ON advice_article_invitations
  FOR ALL TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor'))
  WITH CHECK (cms_role() IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "service role full access article submissions"
  ON advice_article_submissions;
CREATE POLICY "service role full access article submissions"
  ON advice_article_submissions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "admins manage article submissions"
  ON advice_article_submissions;
CREATE POLICY "admins manage article submissions"
  ON advice_article_submissions
  FOR ALL TO authenticated
  USING (cms_role() IN ('owner', 'admin', 'editor'))
  WITH CHECK (cms_role() IN ('owner', 'admin', 'editor'));

DROP POLICY IF EXISTS "contributors read own submissions"
  ON advice_article_submissions;
CREATE POLICY "contributors read own submissions"
  ON advice_article_submissions
  FOR SELECT TO authenticated
  USING (
    author_clerk_id = (auth.jwt() ->> 'sub')
    OR lower(author_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

DROP POLICY IF EXISTS "contributors update own editable submissions"
  ON advice_article_submissions;
CREATE POLICY "contributors update own editable submissions"
  ON advice_article_submissions
  FOR UPDATE TO authenticated
  USING (
    status IN ('draft', 'changes_requested')
    AND (
      author_clerk_id = (auth.jwt() ->> 'sub')
      OR lower(author_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
  WITH CHECK (
    status IN ('draft', 'changes_requested', 'submitted')
    AND (
      author_clerk_id = (auth.jwt() ->> 'sub')
      OR lower(author_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );
