import type { Treatment, InvitationPalette } from '@/components/guests/InvitationVisual'
import type { InvitationContent } from '@/components/guests/StructuredInvitation'
import type { Product as BaseProduct } from '@/components/guests/productInfo'

// Catalog product — shared Product + visual treatment + optional designer/sample fields.
// Lives in a plain (non-'use client') module so both server and client components
// can import the dataset cleanly.
export type CatalogProduct = BaseProduct & {
  designer: string
  freeSample?: boolean
  treatment: Treatment
  /** Required for catalog products — TZS per digital card (the primary product). */
  digitalUnitPrice: number
  /** URL-safe slug (CMS-managed). Optional for bundled fallback products. */
  slug?: string
  /** Attached hero card artwork. When set, replaces the CSS `treatment` on the page. */
  imageUrl?: string
  /** Extra attached card views shown in the gallery. */
  gallery?: string[]
  /** Structured invite content. When set, overrides the category-derived default. */
  content?: InvitationContent
  /** Structured theme id. When set, overrides the treatment-derived theme. */
  themeId?: string
  /** Supabase public storage URL for the Figma-exported SVG. Populated by design team. */
  designImage?: string
  /** Per-swatch palettes — index matches swatches[]. Must equal swatches.length (1–5). */
  palettes: InvitationPalette[]
}

