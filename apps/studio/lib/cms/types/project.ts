import { z } from 'zod';
import { defineContentType } from './define';

// Portfolio project — replaces studio_projects. Preserves the full legacy
// shape (slug, number, category, hero copy, cover image, stats, highlights)
// so the public /portfolio pages can keep rendering from studio_documents
// with no component changes.
const projectSchema = z.object({
  slug:             z.string().trim().min(1, 'Slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  number:           z.string().trim().max(10).default(''),
  category:         z.string().trim().max(80).default(''),
  title:            z.string().trim().min(1, 'Title is required').max(200),
  description:      z.string().trim().max(500).default(''),
  full_description: z.string().trim().max(5000).default(''),

  cover_image:  z.object({ asset_id: z.string().uuid() }).nullable().default(null),

  video_url:     z.string().trim().max(500).optional().default(''),
  sort_order:    z.coerce.number().int().min(0).default(0),

  stats: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        value: z.string().trim().min(1).max(80),
      })
    )
    .default([]),

  highlights: z
    .array(
      z.object({
        text: z.string().trim().min(1).max(500),
      })
    )
    .default([]),

  seo_title:       z.string().trim().max(200).optional().default(''),
  seo_description: z.string().trim().max(500).optional().default(''),
});

export type ProjectDoc = z.infer<typeof projectSchema>;

export const project = defineContentType<ProjectDoc>({
  type: 'project',
  label: 'Project',
  pluralLabel: 'Portfolio',
  icon: 'BsFolder2Open',
  schema: projectSchema,
  titleField: 'title',
  subtitleField: 'category',
  publishable: true,
  defaultSort: 'updated_at',
  defaultSortDirection: 'desc',
  fields: [
    { name: 'title',       type: 'string', label: 'Title',       required: true, maxLength: 200 },
    { name: 'slug',        type: 'string', label: 'Slug',        required: true, maxLength: 200, help: 'URL segment — lowercase letters, numbers, and hyphens only.' },
    { name: 'number',      type: 'string', label: 'Project number', maxLength: 10, placeholder: 'e.g. 04', help: 'Display number shown in portfolio listings.' },
    { name: 'category',    type: 'string', label: 'Category',    maxLength: 80, placeholder: 'e.g. Commercial, Music Video' },
    { name: 'sort_order',  type: 'number', label: 'Sort order',  min: 0, step: 1, default: 0, help: 'Lower numbers appear first.' },
    { name: 'description', type: 'text',   label: 'Short description', rows: 3, maxLength: 500, placeholder: 'One-line summary shown in portfolio listings.' },
    { name: 'cover_image', type: 'image',  label: 'Cover image', aspectRatio: 16 / 9 },
    { name: 'video_url',   type: 'string', label: 'Video URL',   maxLength: 500, placeholder: 'https://...' },
    { name: 'full_description', type: 'text', label: 'Full description', rows: 8, maxLength: 5000 },
    {
      name: 'stats',
      type: 'array',
      label: 'Stats',
      itemLabel: 'Stat',
      help: 'Key-value metrics shown on the project page.',
      itemFields: [
        { name: 'label', type: 'string', label: 'Label', required: true, maxLength: 80, placeholder: 'e.g. Views' },
        { name: 'value', type: 'string', label: 'Value', required: true, maxLength: 80, placeholder: 'e.g. 2.4M' },
      ],
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Highlights',
      itemLabel: 'Highlight',
      help: 'Bullet points of what made this project notable.',
      itemFields: [
        { name: 'text', type: 'text', label: 'Text', required: true, rows: 2, maxLength: 500 },
      ],
    },
    { name: 'seo_title',       type: 'string', label: 'SEO title',       maxLength: 200 },
    { name: 'seo_description', type: 'text',   label: 'SEO description', rows: 2, maxLength: 500 },
  ],
});
