import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { PreviewBanner } from '@/components/PreviewBanner'
import { findCategory } from '@/data/invitations-categories'
import { loadInvitationCategoriesList } from '@/lib/cms/invitations-categories'
import { loadInvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import { styleStripFromCategories } from '@/lib/cms/invitations-style-strip'
import { loadInvitationsExploreStylesContent } from '@/lib/cms/invitations-explore-styles'
import { loadInvitationsFreeWebsitePromoContent } from '@/lib/cms/invitations-free-website-promo'
import { loadInvitationProducts } from '@/lib/cms/invitations-products'
import InvitationsCategoryClient from './InvitationsCategoryClient'

// CMS-driven page: ISR safety net so published changes appear on the public
// site within ~60s even if the admin's on-demand revalidation doesn't reach
// this deployment. See apps/opus_admin/src/lib/revalidate.ts.
export const revalidate = 60

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
  const description = `Browse ${cat.label.toLowerCase()} designs — bilingual digital invitations for Tanzanian weddings.`
  return {
    title: `${cat.label} | OpusPass Invitations`,
    description,
    openGraph: {
      title: `${cat.label} | OpusPass Invitations`,
      description,
      images: cat.img ? [{ url: cat.img, alt: cat.label }] : [],
      type: 'website',
    },
  }
}

export default async function InvitationsCategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params
  const [{ isEnabled: isDraft }, categories, products, promoBanner, exploreStyles, freeWebsitePromo] =
    await Promise.all([
      draftMode(),
      loadInvitationCategoriesList(),
      loadInvitationProducts(),
      loadInvitationsPromoBannerContent(),
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
        styleStrip={styleStripFromCategories(categories)}
        exploreStyles={exploreStyles}
        freeWebsitePromo={freeWebsitePromo}
      />
    </>
  )
}
