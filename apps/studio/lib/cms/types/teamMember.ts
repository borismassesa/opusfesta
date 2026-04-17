import { z } from 'zod';
import { defineContentType } from './define';

const teamMemberSchema = z.object({
  name:       z.string().trim().min(1, 'Name is required').max(120),
  role:       z.string().trim().min(1, 'Role is required').max(120),
  bio:        z.string().trim().max(2000).default(''),
  avatar:     z.object({ asset_id: z.string().uuid() }).nullable().default(null),

  social_twitter:   z.string().trim().max(200).default(''),
  social_instagram: z.string().trim().max(200).default(''),
  social_linkedin:  z.string().trim().max(200).default(''),
  social_website:   z.string().trim().max(200).default(''),

  sort_order: z.coerce.number().int().min(0).default(0),
});

export type TeamMemberDoc = z.infer<typeof teamMemberSchema>;

export const teamMember = defineContentType<TeamMemberDoc>({
  type: 'teamMember',
  label: 'Team member',
  pluralLabel: 'Team',
  icon: 'BsPeople',
  schema: teamMemberSchema,
  titleField: 'name',
  subtitleField: 'role',
  publishable: true,
  defaultSort: 'updated_at',
  defaultSortDirection: 'desc',
  fields: [
    { name: 'name', type: 'string', label: 'Name', required: true, maxLength: 120 },
    { name: 'role', type: 'string', label: 'Role', required: true, maxLength: 120, placeholder: 'e.g. Director of Photography' },
    { name: 'avatar', type: 'image', label: 'Avatar', aspectRatio: 1 },
    { name: 'bio',  type: 'text',   label: 'Bio',  rows: 5, maxLength: 2000 },

    { name: 'social_twitter',   type: 'string', label: 'Twitter / X URL', maxLength: 200, placeholder: 'https://x.com/…' },
    { name: 'social_instagram', type: 'string', label: 'Instagram URL',   maxLength: 200, placeholder: 'https://instagram.com/…' },
    { name: 'social_linkedin',  type: 'string', label: 'LinkedIn URL',    maxLength: 200, placeholder: 'https://linkedin.com/in/…' },
    { name: 'social_website',   type: 'string', label: 'Website URL',     maxLength: 200, placeholder: 'https://…' },

    { name: 'sort_order', type: 'number', label: 'Sort order', min: 0, step: 1, default: 0, help: 'Lower numbers appear first.' },
  ],
});
