import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { PreviewBanner } from '@/components/PreviewBanner'
import { loadInvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import { loadInvitationsStyleStripContent } from '@/lib/cms/invitations-style-strip'
import { loadInvitationsExploreStylesContent } from '@/lib/cms/invitations-explore-styles'
import { loadInvitationsFreeWebsitePromoContent } from '@/lib/cms/invitations-free-website-promo'
import { loadInvitationProducts } from '@/lib/cms/invitations-products'
import { loadPackagesContent, packageFromPrice } from '@/lib/cms/packages'
import InvitationsCatalogClient from './InvitationsCatalogClient'

// CMS-driven page: ISR safety net so published changes appear on the public
// site within ~60s even if the admin's on-demand revalidation doesn't reach
// this deployment. See apps/opus_admin/src/lib/revalidate.ts.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Wedding Invitations | OpusFesta',
  description:
    'Browse wedding invitations, save the dates, and RSVP cards. Personalise with your colours, photos, and bilingual copy — designed for Tanzanian weddings.',
}

export default async function InvitationsCatalogPage() {
  const [{ isEnabled: isDraft }, products, promoBanner, styleStrip, exploreStyles, freeWebsitePromo, packages] =
    await Promise.all([
      draftMode(),
      loadInvitationProducts(),
      loadInvitationsPromoBannerContent(),
      loadInvitationsStyleStripContent(),
      loadInvitationsExploreStylesContent(),
      loadInvitationsFreeWebsitePromoContent(),
      loadPackagesContent(),
    ])
  return (
    <>
      {isDraft && <PreviewBanner />}
      <InvitationsCatalogClient
        products={products}
        fromGuestPrice={packageFromPrice(packages)}
        promoBanner={promoBanner}
        styleStrip={styleStrip}
        exploreStyles={exploreStyles}
        freeWebsitePromo={freeWebsitePromo}
      />
    </>
  )
}
