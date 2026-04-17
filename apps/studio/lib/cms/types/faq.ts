import { z } from 'zod';
import { defineContentType } from './define';

const faqSchema = z.object({
  question:   z.string().trim().min(1, 'Question is required').max(500),
  answer:     z.string().trim().min(1, 'Answer is required').max(5000),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type FaqDoc = z.infer<typeof faqSchema>;

export const faq = defineContentType<FaqDoc>({
  type: 'faq',
  label: 'FAQ',
  pluralLabel: 'FAQs',
  icon: 'BsQuestionCircle',
  schema: faqSchema,
  titleField: 'question',
  subtitleField: 'answer',
  publishable: true,
  defaultSort: 'created_at',
  defaultSortDirection: 'desc',
  fields: [
    {
      name: 'question',
      type: 'text',
      label: 'Question',
      required: true,
      maxLength: 500,
      rows: 2,
      placeholder: 'e.g. How long does a typical project take?',
    },
    {
      name: 'answer',
      type: 'text',
      label: 'Answer',
      required: true,
      maxLength: 5000,
      rows: 6,
      placeholder: 'Write the answer. Plain text for now — rich formatting comes in Phase 2.',
    },
    {
      name: 'sort_order',
      type: 'number',
      label: 'Sort order',
      help: 'Lower numbers appear first in the public FAQ list.',
      min: 0,
      step: 1,
      default: 0,
    },
  ],
});
