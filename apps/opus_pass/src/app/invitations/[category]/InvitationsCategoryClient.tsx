'use client'

import { useMemo } from 'react'
import { filterProductsByCategory, type InvitationCategory } from '@/data/invitations-categories'
import InvitationsCatalogClient, { PRODUCTS } from '../catalog/InvitationsCatalogClient'

export default function InvitationsCategoryClient({ category }: { category: InvitationCategory }) {
  const filtered = useMemo(
    () => filterProductsByCategory(PRODUCTS, category.slug),
    [category.slug],
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
    />
  )
}
