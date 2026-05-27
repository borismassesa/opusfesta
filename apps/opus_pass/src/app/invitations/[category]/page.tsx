import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { PreviewBanner } from '@/components/PreviewBanner'
import { findCategory } from '@/data/invitations-categories'
import { loadInvitationCategoriesList } from '@/lib/cms/invitations-categories'
import { loadInvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import { loadInvitationsStyleStripContent } from '@/lib/cms/invitations-style-strip'
import { loadInvitationsExploreStylesContent } from '@/lib/cms/invitations-explore-styles'
import { loadInvitationsFreeWebsitePromoContent } from '@/lib/cms/invitations-free-website-promo'
import { loadInvitationProducts } from '@/lib/cms/invitations-products'
import InvitationsCategoryClient from './InvitationsCategoryClient'

type Params = { category: string }

export async function generateStaticParams() {
  const categories = await loadInvitationCategoriesList()
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params
  const categories = await loadInvitationCategoriesList()
  const cat = findCategory(categories, category)
  if (!cat) return { title: 'Category not found | OpusPass' }
  return {
    title: `${cat.label} | OpusPass Invitations`,
    description: `Browse ${cat.label.toLowerCase()} designs — bilingual digital invitations for Tanzanian weddings.`,
  }
}

export default async function InvitationsCategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params
  const [{ isEnabled: isDraft }, categories, products, promoBanner, styleStrip, exploreStyles, freeWebsitePromo] =
    await Promise.all([
      draftMode(),
      loadInvitationCategoriesList(),
      loadInvitationProducts(),
      loadInvitationsPromoBannerContent(),
      loadInvitationsStyleStripContent(),
      loadInvitationsExploreStylesContent(),
      loadInvitationsFreeWebsitePromoContent(),
    ])
  const cat = findCategory(categories, category)
  if (!cat) return notFound()
  return (
    <>
      {isDraft && <PreviewBanner />}
      <InvitationsCategoryClient
        category={cat}
        categories={categories}
        products={products}
        promoBanner={promoBanner}
        styleStrip={styleStrip}
        exploreStyles={exploreStyles}
        freeWebsitePromo={freeWebsitePromo}
      />
    </>
  )
}
