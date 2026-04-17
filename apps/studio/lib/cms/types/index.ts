import type { ContentType } from './define';
import { faq } from './faq';
import { article } from './article';
import { project } from './project';
import { testimonial } from './testimonial';
import { teamMember } from './teamMember';
import { service } from './service';

// Registry of all content types. Adding a new type is a 3-step process:
//   1. Create lib/cms/types/<name>.ts with a Zod schema + defineContentType call
//   2. Import it here and add it to the registry map
//   3. (Optional) Add a dedicated renderer in components/cms/render/
const registry: Record<string, ContentType> = {
  faq:         faq         as unknown as ContentType,
  article:     article     as unknown as ContentType,
  project:     project     as unknown as ContentType,
  testimonial: testimonial as unknown as ContentType,
  teamMember:  teamMember  as unknown as ContentType,
  service:     service     as unknown as ContentType,
};

export const contentTypes = registry;

export type ContentTypeKey = string;

export function getContentType(key: string): ContentType | null {
  return registry[key] ?? null;
}

export function listContentTypes(): ContentType[] {
  return Object.values(registry);
}
