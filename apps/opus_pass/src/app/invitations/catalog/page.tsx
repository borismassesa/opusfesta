import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { PreviewBanner } from '@/components/PreviewBanner'
import { loadInvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import { loadInvitationsStyleStripContent } from '@/lib/cms/invitations-style-strip'
import { loadInvitationsExploreStylesContent } from '@/lib/cms/invitations-explore-styles'
import { loadInvitationsFreeWebsitePromoContent } from '@/lib/cms/invitations-free-website-promo'
import { loadInvitationProducts } from '@/lib/cms/invitations-products'
import InvitationsCatalogClient from './InvitationsCatalogClient'

export const metadata: Metadata = {
  title: 'Wedding Invitations | OpusFesta',
  description:
    'Browse wedding invitations, save the dates, and RSVP cards. Personalise with your colours, photos, and bilingual copy — designed for Tanzanian weddings.',
}

export default async function InvitationsCatalogPage() {
  const [{ isEnabled: isDraft }, products, promoBanner, styleStrip, exploreStyles, freeWebsitePromo] =
    await Promise.all([
      draftMode(),
      loadInvitationProducts(),
      loadInvitationsPromoBannerContent(),
      loadInvitationsStyleStripContent(),
      loadInvitationsExploreStylesContent(),
      loadInvitationsFreeWebsitePromoContent(),
    ])
  return (
    <>
      {isDraft && <PreviewBanner />}
      <InvitationsCatalogClient
        products={products}
        promoBanner={promoBanner}
        styleStrip={styleStrip}
        exploreStyles={exploreStyles}
        freeWebsitePromo={freeWebsitePromo}
      />
    </>
  )
}
