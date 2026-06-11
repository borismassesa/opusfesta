import type { InvitationCategory } from '@/data/invitations-categories'

export type InvitationsStyleStripItem = {
  id: string
  label: string
  img: string
  alt: string
  href?: string
}

export type InvitationsStyleStripContent = {
  items: InvitationsStyleStripItem[]
}

/**
 * The catalog circle-strip mirrors the real invitation categories (the same
 * list behind /invitations/[category]) instead of a separately-managed CMS
 * section, so the chips always match the shoppable categories.
 */
export function styleStripFromCategories(
  categories: InvitationCategory[],
): InvitationsStyleStripContent {
  return {
    items: categories.map((c) => ({
      id: c.slug,
      label: c.label,
      img: c.img,
      alt: c.alt,
      href: `/invitations/${c.slug}`,
    })),
  }
}
