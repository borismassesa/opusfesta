import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { PreviewBanner } from '@/components/PreviewBanner'
import { loadInvitationsFeaturesContent } from '@/lib/cms/invitations-features'
import { loadInvitationsFaqsContent } from '@/lib/cms/invitations-faqs'
import {
  loadInvitationsEditorsPicksContent,
  editorsPicksRowsFromProducts,
} from '@/lib/cms/invitations-editors-picks'
import { loadInvitationsCategoriesContent, cmsCategoryToRuntime } from '@/lib/cms/invitations-categories'
import { styleStripFromCategories } from '@/lib/cms/invitations-style-strip'
import { loadInvitationProducts } from '@/lib/cms/invitations-products'
import { loadPackagesContent, packageFromPrice } from '@/lib/cms/packages'
import { getLocale } from '@/lib/cms/locale'
import { InvitationShowcase } from '@/components/home/InvitationShowcase'
import InvitationsLandingClient from './InvitationsLandingClient'
import JsonLd from '@/components/JsonLd'

// CMS-driven AND locale-aware: sections resolve content from the per-visitor
// `opuspass_locale` cookie (see lib/cms/locale.ts), so this route must render
// dynamically — a shared ISR cache entry keys only on path and would serve one
// visitor's language to everyone. Published changes appear immediately (no ISR
// window); the admin's on-demand revalidate is a harmless no-op for this route.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wedding Invitations | OpusPass',
  description:
    'Wedding invitations, save the dates, RSVPs and thank yous designed for Tanzanian weddings. Bilingual wording, free wedding website, free RSVP page.',
}

export default async function InvitationsLandingPage() {
  const locale = await getLocale()
  const [
    { isEnabled: isDraft },
    categoriesContent,
    features,
    faqs,
    editorsPicksTemplate,
    products,
    packages,
  ] = await Promise.all([
    draftMode(),
    loadInvitationsCategoriesContent(locale),
    loadInvitationsFeaturesContent(locale),
    loadInvitationsFaqsContent(locale),
    loadInvitationsEditorsPicksContent(locale),
    loadInvitationProducts(locale),
    loadPackagesContent(locale),
  ])
  const categories = categoriesContent.categories.map(cmsCategoryToRuntime)
  const styleStrip = styleStripFromCategories(categories)
  // Editors' Picks renders live products from the DB (same source as the
  // catalog); the CMS section only supplies the editorial row headings.
  const editorsPicks = editorsPicksRowsFromProducts(products, editorsPicksTemplate)
  const fromGuestPrice = packageFromPrice(packages)
  const faqSchema = faqs.items.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null

  return (
    <>
      {faqSchema && <JsonLd data={faqSchema} />}
      {isDraft && <PreviewBanner />}
      <InvitationsLandingClient
        styleStrip={styleStrip}
        heroHeading={categoriesContent.heading}
        heroDescription={categoriesContent.description}
        features={features}
        faqs={faqs}
        editorsPicks={editorsPicks}
        fromGuestPrice={fromGuestPrice}
        perGuestLabel={packages.perGuestLabel}
        perDesignLabel={packages.perDesignLabel}
        testimonials={<InvitationShowcase />}
      />
    </>
  )
}
