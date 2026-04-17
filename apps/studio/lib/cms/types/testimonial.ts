import { z } from 'zod';
import { defineContentType } from './define';

const testimonialSchema = z.object({
  quote:      z.string().trim().min(1, 'Quote is required').max(1000),
  author:     z.string().trim().min(1, 'Author is required').max(120),
  role:       z.string().trim().max(120).default(''),
  avatar:     z.object({ asset_id: z.string().uuid() }).nullable().default(null),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type TestimonialDoc = z.infer<typeof testimonialSchema>;

export const testimonial = defineContentType<TestimonialDoc>({
  type: 'testimonial',
  label: 'Testimonial',
  pluralLabel: 'Testimonials',
  icon: 'BsStar',
  schema: testimonialSchema,
  titleField: 'author',
  subtitleField: 'quote',
  publishable: true,
  defaultSort: 'updated_at',
  defaultSortDirection: 'desc',
  fields: [
    { name: 'quote',  type: 'text',   label: 'Quote',  required: true, rows: 4, maxLength: 1000 },
    { name: 'author', type: 'string', label: 'Author', required: true, maxLength: 120 },
    { name: 'role',   type: 'string', label: 'Role',   maxLength: 120, placeholder: 'e.g. Creative Director, Acme Studios' },
    { name: 'avatar', type: 'image',  label: 'Avatar', aspectRatio: 1 },
    { name: 'sort_order', type: 'number', label: 'Sort order', min: 0, step: 1, default: 0, help: 'Lower numbers appear first.' },
  ],
});
