-- One-shot compatibility migration for OF-CTR-DRAFT-001.
-- Safe to run more than once after applying the schema migration.

UPDATE advice_article_submissions
SET
  status = CASE
    WHEN status = 'submitted' THEN 'pending'
    WHEN status = 'changes_requested' THEN 'revisions'
    ELSE status
  END,
  summary = coalesce(summary, nullif(excerpt, ''), nullif(description, ''), ''),
  cover_image_url = coalesce(cover_image_url, nullif(hero_media_src, '')),
  cover_image_alt = coalesce(cover_image_alt, nullif(hero_media_alt, '')),
  word_count = coalesce(
    word_count,
    (
      SELECT count(*)
      FROM regexp_split_to_table(coalesce(body::text, ''), '\s+') AS token
      WHERE token <> ''
    ),
    0
  )
WHERE status IN ('draft', 'submitted', 'changes_requested')
   OR summary IS NULL
   OR cover_image_url IS NULL
   OR cover_image_alt IS NULL
   OR word_count IS NULL;
