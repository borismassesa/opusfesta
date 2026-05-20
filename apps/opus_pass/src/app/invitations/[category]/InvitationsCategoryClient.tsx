'use client'

import { useMemo } from 'react'
import { filterProductsByCategory, type InvitationCategory } from '@/data/invitations-categories'
import { PRODUCTS } from '@/data/invitations-products'
import type { InvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import type { InvitationsStyleStripContent } from '@/lib/cms/invitations-style-strip'
import type { InvitationsExploreStylesContent } from '@/lib/cms/invitations-explore-styles'
import type { InvitationsFreeWebsitePromoContent } from '@/lib/cms/invitations-free-website-promo'
import InvitationsCatalogClient from '../catalog/InvitationsCatalogClient'

export default function InvitationsCategoryClient({
  category,
  categories,
  promoBanner,
  styleStrip,
  exploreStyles,
  freeWebsitePromo,
}: {
  category: InvitationCategory
  categories: InvitationCategory[]
  promoBanner: InvitationsPromoBannerContent
  styleStrip: InvitationsStyleStripContent
  exploreStyles: InvitationsExploreStylesContent
  freeWebsitePromo: InvitationsFreeWebsitePromoContent
}) {
  const filtered = useMemo(
    () => filterProductsByCategory(categories, PRODUCTS, category.slug),
    [categories, category.slug],
  )

  // If the slug has no matching designs yet, fall back to the full catalog so
  // the page still feels useful — the title + subtitle still reflect the
  // chosen category, but the user sees browsable designs instead of an empty grid.
  const products = filtered.length > 0 ? filtered : PRODUCTS

  return (
    <InvitationsCatalogClient
      products={products}
      title={category.label}
      subtitle={category.subtitle}
      promoBanner={promoBanner}
      styleStrip={styleStrip}
      exploreStyles={exploreStyles}
      freeWebsitePromo={freeWebsitePromo}
    />
  )
}
