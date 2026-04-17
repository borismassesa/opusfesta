import { z } from 'zod';
import { defineContentType } from './define';

const serviceSchema = z.object({
  title:       z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  price:       z.string().trim().max(80).default(''),
  cover_image: z.object({ asset_id: z.string().uuid() }).nullable().default(null),

  includes: z
    .array(
      z.object({
        text: z.string().trim().min(1).max(200),
      })
    )
    .default([]),

  sort_order: z.coerce.number().int().min(0).default(0),
});

export type ServiceDoc = z.infer<typeof serviceSchema>;

export const service = defineContentType<ServiceDoc>({
  type: 'service',
  label: 'Service',
  pluralLabel: 'Services',
  icon: 'BsWrench',
  schema: serviceSchema,
  titleField: 'title',
  subtitleField: 'description',
  publishable: true,
  defaultSort: 'updated_at',
  defaultSortDirection: 'desc',
  fields: [
    { name: 'title', type: 'string', label: 'Title', required: true, maxLength: 200 },
    { name: 'price', type: 'string', label: 'Price',  maxLength: 80, placeholder: 'e.g. From $5k' },
    { name: 'description', type: 'text', label: 'Description', required: true, rows: 4, maxLength: 2000 },
    { name: 'cover_image', type: 'image', label: 'Cover image', aspectRatio: 16 / 9 },
    {
      name: 'includes',
      type: 'array',
      label: 'Includes',
      itemLabel: 'Item',
      help: 'Bullet list of what the service includes.',
      itemFields: [
        { name: 'text', type: 'string', label: 'Text', required: true, maxLength: 200 },
      ],
    },
    { name: 'sort_order', type: 'number', label: 'Sort order', min: 0, step: 1, default: 0, help: 'Lower numbers appear first.' },
  ],
});
