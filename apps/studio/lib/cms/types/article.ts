import { z } from 'zod';
import { defineContentType } from './define';

// Article: the Phase 2 showcase content type. Exercises string, richtext,
// image, array, select, and date fields end-to-end.
const articleSchema = z.object({
  title:         z.string().trim().min(1, 'Title is required').max(200),
  slug:          z.string().trim().min(1, 'Slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  excerpt:       z.string().trim().max(500).optional().default(''),
  category:      z.string().trim().max(80).optional().default(''),
  author:        z.string().trim().max(120).optional().default(''),
  published_at:  z.string().optional().default(''),

  // Rich text stored as Tiptap JSON. Loose validation — we trust the editor
  // to produce structurally valid documents and the renderer to cope with
  // anything it doesn't understand.
  body: z
    .object({
      type: z.literal('doc'),
      content: z.array(z.any()).optional(),
    })
    .passthrough()
    .default({ type: 'doc', content: [{ type: 'paragraph' }] }),

  // Reference into studio_assets.
  cover_image: z
    .object({
      asset_id: z.string().uuid(),
    })
    .nullable()
    .default(null),

  // Repeatable callout blocks for mid-article highlights.
  callouts: z
    .array(
      z.object({
        heading: z.string().trim().min(1).max(200),
        body:    z.string().trim().min(1).max(1000),
      })
    )
    .default([]),

  // Legacy HTML body preserved during Phase 5 backfill from studio_articles.
  // The public renderer prefers `body` (structured Tiptap JSON) and falls
  // back to this only when body is empty. Editors are expected to migrate
  // content by copy-pasting into the new rich text editor over time.
  body_html: z.string().max(200_000).optional().default(''),
});

export type ArticleDoc = z.infer<typeof articleSchema>;

export const article = defineContentType<ArticleDoc>({
  type: 'article',
  label: 'Article',
  pluralLabel: 'Articles',
  icon: 'BsFileText',
  schema: articleSchema,
  titleField: 'title',
  subtitleField: 'excerpt',
  publishable: true,
  defaultSort: 'updated_at',
  defaultSortDirection: 'desc',
  fields: [
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      required: true,
      maxLength: 200,
      placeholder: 'A succinct, compelling headline',
    },
    {
      name: 'slug',
      type: 'string',
      label: 'Slug',
      required: true,
      maxLength: 200,
      placeholder: 'my-article-title',
      help: 'URL segment — lowercase letters, numbers, and hyphens only.',
    },
    {
      name: 'excerpt',
      type: 'text',
      label: 'Excerpt',
      rows: 3,
      maxLength: 500,
      placeholder: 'Short summary shown in lists and social previews.',
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { value: 'film',          label: 'Film' },
        { value: 'photography',   label: 'Photography' },
        { value: 'behind-the-scenes', label: 'Behind the scenes' },
        { value: 'craft',         label: 'Craft' },
      ],
      placeholder: 'Select a category',
    },
    {
      name: 'author',
      type: 'string',
      label: 'Author',
      maxLength: 120,
      placeholder: 'e.g. OpusFesta Studio',
    },
    {
      name: 'published_at',
      type: 'date',
      label: 'Publish date',
      help: 'Display date — separate from the actual publish action.',
    },
    {
      name: 'cover_image',
      type: 'image',
      label: 'Cover image',
      aspectRatio: 16 / 9,
      help: 'Click on the image after upload to set the focal point for automatic cropping.',
    },
    {
      name: 'body',
      type: 'richtext',
      label: 'Body',
      required: true,
      help: 'Rich text with headings, lists, links, blockquotes, and inline code.',
    },
    {
      name: 'callouts',
      type: 'array',
      label: 'Callouts',
      itemLabel: 'Callout',
      help: 'Optional highlight boxes rendered between paragraphs.',
      itemFields: [
        {
          name: 'heading',
          type: 'string',
          label: 'Heading',
          required: true,
          maxLength: 200,
        },
        {
          name: 'body',
          type: 'text',
          label: 'Body',
          required: true,
          rows: 3,
          maxLength: 1000,
        },
      ],
    },
    {
      name: 'body_html',
      type: 'text',
      label: 'Legacy HTML body',
      rows: 12,
      maxLength: 200_000,
      help: 'Read-only legacy content from the old articles table. Prefer editing the Body field above. Leave this untouched for articles you haven\'t migrated yet — the public site falls back to it when Body is empty.',
    },
  ],
});
