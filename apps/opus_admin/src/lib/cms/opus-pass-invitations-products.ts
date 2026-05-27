// Client-safe types + helpers for the OpusPass invitation products CMS.
// Loaders live in the page.tsx files to keep this module free of server imports.

// Built-in CSS card designs (used when no artwork is attached). Must stay in
// sync with the `Treatment` union in opus_pass InvitationVisual.tsx.
export const PRODUCT_TREATMENTS = [
  'classic-serif',
  'minimal-line',
  'modern-block',
  'floral-border',
  'navy-gold',
  'blush-frame',
  'sage-panel',
  'cultural-red',
  'arch-script',
  'photo-overlay',
] as const

export type ProductTreatment = (typeof PRODUCT_TREATMENTS)[number]

export const PRODUCT_CATEGORIES = [
  'Wedding Invitations',
  'All-in-One Wedding Invitations',
  'Save the Dates',
  'Engagement Invitations',
  'Bridal Shower Invitations',
  'Reception Cards',
  'Wedding Programmes',
  'Menu Cards',
  'Thank You Cards',
  'Birthday Invitations',
  'Welcome Signs',
] as const

export type InvitationProductRecord = {
  id: string
  slug: string
  name: string
  designer: string
  category: string

  /** Optional struck-through "before" total price (TZS). */
  price_was: number | null
  /** Current total price (TZS). */
  price_now: number
  /** TZS per digital card — the primary product. */
  digital_unit_price: number
  free_sample: boolean

  /** Design colour swatches (hex strings). */
  swatches: string[]
  /** Built-in CSS card design, used when image_url is empty. */
  treatment: ProductTreatment
  /** Attached hero card artwork. When set, replaces the CSS design on the page. */
  image_url: string
  /** Extra card views/scenes shown as gallery thumbnails. */
  gallery: string[]

  published: boolean
  sort_order: number

  created_at: string
  updated_at: string
}

export function emptyInvitationProduct(
  partial: Partial<InvitationProductRecord> = {},
): InvitationProductRecord {
  return {
    id: '',
    slug: '',
    name: '',
    designer: '',
    category: 'Wedding Invitations',
    price_was: null,
    price_now: 0,
    digital_unit_price: 10000,
    free_sample: true,
    swatches: ['#F5EFE3', '#1A1A1A', '#A6B89A'],
    treatment: 'classic-serif',
    image_url: '',
    gallery: [],
    published: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...partial,
  }
}

/** URL-safe slug from a free-text name. */
export function slugifyProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
