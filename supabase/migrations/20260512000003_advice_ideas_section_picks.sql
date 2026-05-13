-- Explicit admin-curated article picks for the secondary sections on
-- /advice-and-ideas. Editor Picks already has its own mechanism
-- (`advice_ideas_posts.featured_rank`, added in migration 20260512000002)
-- — we deliberately do NOT migrate it here to avoid touching what just
-- shipped. New sections live in this side table.
--
-- One row per (section, post) pair; rank is the slot the article fills
-- on the public page. Empty slots auto-fill from the most recent
-- published posts at render time (logic in apps/opus_website/src/app/
-- advice-and-ideas/page.tsx — keep this comment + that file in sync).

CREATE TABLE IF NOT EXISTS advice_ideas_section_picks (
  section_key text NOT NULL
    CHECK (section_key IN ('loved_by_couples', 'our_favorites')),
  post_id uuid NOT NULL REFERENCES advice_ideas_posts(id) ON DELETE CASCADE,
  rank integer NOT NULL CHECK (rank > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (section_key, post_id),
  UNIQUE (section_key, rank)
);

-- Primary index for the per-section read pattern: "give me this
-- section's picks in slot order."
CREATE INDEX IF NOT EXISTS idx_advice_ideas_section_picks_section_rank
  ON advice_ideas_section_picks (section_key, rank);

-- Reverse-lookup helper: "what sections is this post pinned to?" Used
-- by the admin list view to render section badges on each article row.
CREATE INDEX IF NOT EXISTS idx_advice_ideas_section_picks_post
  ON advice_ideas_section_picks (post_id);

-- Standard updated_at trigger so the timestamp tracks edits.
DROP TRIGGER IF EXISTS update_advice_ideas_section_picks_updated_at
  ON advice_ideas_section_picks;
CREATE TRIGGER update_advice_ideas_section_picks_updated_at
  BEFORE UPDATE ON advice_ideas_section_picks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE advice_ideas_section_picks IS
  'Admin-curated article picks for sections on /advice-and-ideas other than Editor Picks (which uses advice_ideas_posts.featured_rank). One row per (section, post) pair. Empty slots auto-fill from latest published posts at render time.';

NOTIFY pgrst, 'reload schema';
