import type { Treatment, InvitationPalette } from '@/components/guests/InvitationVisual'
import type { InvitationContent } from '@/components/guests/StructuredInvitation'
import type { Product as BaseProduct } from '@/components/guests/productInfo'

// Catalog product — shared Product + visual treatment + CMS-driven fields.
// Lives in a plain (non-'use client') module so both server and client components
// can import the type cleanly.
export type CatalogProduct = BaseProduct & {
  designer: string
  freeSample?: boolean
  /** Editable "Details" paragraph shown under the card. Empty → auto-generated copy. */
  description?: string
  treatment: Treatment
  /** TZS per digital card (the primary product). */
  digitalUnitPrice: number
  /** URL-safe slug (CMS-managed). */
  slug?: string
  /** Attached hero card artwork. When set, replaces the CSS `treatment` on the page. */
  imageUrl?: string
  /** Extra attached card views shown in the gallery. */
  gallery?: string[]
  /** Designer-uploaded finished card images (max 5), shown in the detail carousel at 5:7. */
  designs?: string[]
  /** Structured invite content. When set, overrides the category-derived default. */
  content?: InvitationContent
  /** SVG used by the card renderer — set to imageUrl at load time. */
  designImage?: string
  /** Per-swatch palettes — index matches swatches[]. */
  palettes: InvitationPalette[]
}
