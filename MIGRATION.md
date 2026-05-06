# OF-CTR-DRAFT-001 Migration Notes

This PR extends the existing `advice_article_submissions` table used by the editorial admin queue.

## Status values

The contributor flow introduces `draft`, `pending`, and `revisions` as the contributor-facing lifecycle:

- `draft`: contributor is still writing; hidden from the admin review queue.
- `pending`: submitted for review; visible in the admin Submissions tab.
- `revisions`: editor requested changes; editable again by the contributor.

The migration keeps legacy admin values (`submitted`, `changes_requested`, `published`) temporarily so existing rows and admin screens continue to work during rollout. New contributor submissions use `pending`.

## Added columns

- `summary text`
- `cover_image_url text`
- `cover_image_alt text`
- `word_count integer not null default 0`
- `locked_until timestamptz`
- `review_notes text`

The migration backfills `summary` from `excerpt`/`description` and cover fields from the legacy hero media fields.

## One-shot legacy draft migration

If legacy contributor drafts exist only in the old contributor article routes, run:

```bash
psql "$DATABASE_URL" -f scripts/migrate-legacy-contributor-drafts.sql
```

The script is idempotent and normalizes old contributor review statuses into the new contributor-facing names where possible.
