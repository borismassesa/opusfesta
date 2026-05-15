-- Add explicit ordering for "Editor Picks" front-page section.
--
-- Until now, the public advice-and-ideas page filtered by `featured = true`
-- and ordered by `published_at DESC` — meaning editors could pick *which*
-- articles appear on the front, but not in what order. The first slot
-- (Trending hero) always defaulted to the most recently published featured
-- post.
--
-- featured_rank lets editors pin specific slots: 1 = Trending hero,
-- 2..5 = Editor Picks row, in that order. NULL = no explicit rank;
-- those articles still appear in the featured set but bubble to the
-- end of the order (after ranked picks, by published_at).

ALTER TABLE advice_ideas_posts
  ADD COLUMN IF NOT EXISTS featured_rank INTEGER;

-- Partial index covers only the small "front page" set (typically <= 5
-- rows). Querying ORDER BY featured_rank ASC stays fast even as the full
-- table grows.
CREATE INDEX IF NOT EXISTS idx_advice_ideas_posts_featured_rank
  ON advice_ideas_posts (featured_rank ASC)
  WHERE featured_rank IS NOT NULL;

COMMENT ON COLUMN advice_ideas_posts.featured_rank IS
  'Editor-picked slot on the public /advice-and-ideas front. 1=Trending hero, 2..5=Editor Picks. NULL=in featured pool but no pinned slot. The boolean `featured` column remains the source of truth for whether an article appears in the featured pool at all.';

-- Backfill: assign ranks to existing featured rows in published_at DESC
-- order so the public site renders the same articles in the same order
-- it did before this migration. New rank values are stable from here on.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY published_at DESC) AS rn
  FROM advice_ideas_posts
  WHERE featured = true
)
UPDATE advice_ideas_posts p
SET featured_rank = r.rn
FROM ranked r
WHERE p.id = r.id
  AND p.featured_rank IS NULL;

NOTIFY pgrst, 'reload schema';
