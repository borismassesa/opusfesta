import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { PreviewBanner } from '@/components/PreviewBanner'
import { loadInvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import { loadInvitationCategoriesList } from '@/lib/cms/invitations-categories'
import { styleStripFromCategories } from '@/lib/cms/invitations-style-strip'
import { loadInvitationProducts } from '@/lib/cms/invitations-products'
import { loadPackagesContent, packageFromPrice } from '@/lib/cms/packages'
import { getLocale } from '@/lib/cms/locale'
import InvitationsCatalogClient from './InvitationsCatalogClient'

// CMS-driven AND locale-aware (reads the opuspass_locale cookie), so it renders
// dynamically — see lib/cms/locale.ts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wedding Invitations | OpusPass',
  description:
    'Browse wedding invitations, save the dates, and RSVP cards. Personalise with your colours, photos, and bilingual copy — designed for Tanzanian weddings.',
}

export default async function InvitationsCatalogPage() {
  const locale = await getLocale()
  const [{ isEnabled: isDraft }, products, promoBanner, categories, packages] =
    await Promise.all([
      draftMode(),
      loadInvitationProducts(locale),
      loadInvitationsPromoBannerContent(locale),
      loadInvitationCategoriesList(locale),
      loadPackagesContent(locale),
    ])
  return (
    <>
      {isDraft && <PreviewBanner />}
      <InvitationsCatalogClient
        products={products}
        fromGuestPrice={packageFromPrice(packages)}
        perGuestLabel={packages.perGuestLabel}
        perDesignLabel={packages.perDesignLabel}
        fromLabel={packages.fromLabel}
        promoBanner={promoBanner}
        styleStrip={styleStripFromCategories(categories)}
      />
    </>
  )
}
