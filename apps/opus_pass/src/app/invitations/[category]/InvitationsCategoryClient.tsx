'use client'

import { useMemo } from 'react'
import { filterProductsByCategory, type InvitationCategory } from '@/data/invitations-categories'
import type { CatalogProduct } from '@/data/invitations-products'
import type { InvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import type { InvitationsStyleStripContent } from '@/lib/cms/invitations-style-strip'
import InvitationsCatalogClient from '../catalog/InvitationsCatalogClient'

export default function InvitationsCategoryClient({
  category,
  categories,
  products: allProducts,
  fromGuestPrice,
  perGuestLabel,
  perDesignLabel,
  fromLabel,
  promoBanner,
  styleStrip,
}: {
  category: InvitationCategory
  categories: InvitationCategory[]
  products: CatalogProduct[]
  /** Lowest per-guest package price — keeps card pricing identical to the main catalog. */
  fromGuestPrice?: number
  perGuestLabel?: string
  perDesignLabel?: string
  fromLabel?: string
  promoBanner: InvitationsPromoBannerContent
  styleStrip: InvitationsStyleStripContent
}) {
  const filtered = useMemo(
    () => filterProductsByCategory(categories, allProducts, category.slug),
    [categories, allProducts, category.slug],
  )

  // If the slug has no matching designs yet, fall back to the full catalog so
  // the page still feels useful — the title + subtitle still reflect the
  // chosen category, but the user sees browsable designs instead of an empty grid.
  const products = filtered.length > 0 ? filtered : allProducts

  return (
    <InvitationsCatalogClient
      products={products}
      fromGuestPrice={fromGuestPrice}
      perGuestLabel={perGuestLabel}
      perDesignLabel={perDesignLabel}
      fromLabel={fromLabel}
      title={category.label}
      subtitle={category.subtitle}
      promoBanner={promoBanner}
      styleStrip={styleStrip}
    />
  )
}
