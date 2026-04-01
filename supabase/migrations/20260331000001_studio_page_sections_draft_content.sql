-- Add draft content column for save-as-draft workflow
-- When draft_content IS NOT NULL, the section has unpublished changes.
-- Publish copies draft_content → content and sets draft_content = NULL.

alter table studio_page_sections
  add column if not exists draft_content jsonb default null;

comment on column studio_page_sections.draft_content is
  'Staged content not yet published. NULL = no pending changes.';
