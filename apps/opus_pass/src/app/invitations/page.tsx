import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { PreviewBanner } from '@/components/PreviewBanner'
import { loadInvitationsHeroContent } from '@/lib/cms/invitations-hero'
import { loadInvitationsFeaturesContent } from '@/lib/cms/invitations-features'
import { loadInvitationsFeaturedSuiteContent } from '@/lib/cms/invitations-featured-suite'
import { loadInvitationsFaqsContent } from '@/lib/cms/invitations-faqs'
import {
  loadInvitationsEditorsPicksContent,
  editorsPicksRowsFromProducts,
} from '@/lib/cms/invitations-editors-picks'
import { loadInvitationProducts } from '@/lib/cms/invitations-products'
import { loadPackagesContent, packageFromPrice } from '@/lib/cms/packages'
import { InvitationShowcase } from '@/components/home/InvitationShowcase'
import InvitationsLandingClient from './InvitationsLandingClient'
import JsonLd from '@/components/JsonLd'

// CMS-driven page: ISR safety net so published changes appear on the public
// site within ~60s even if the admin's on-demand revalidation doesn't reach
// this deployment. See apps/opus_admin/src/lib/revalidate.ts.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Wedding Invitations | OpusPass',
  description:
    'Wedding invitations, save the dates, RSVPs and thank yous designed for Tanzanian weddings. Bilingual wording, free wedding website, free RSVP page.',
}

export default async function InvitationsLandingPage() {
  const [
    { isEnabled: isDraft },
    hero,
    features,
    featuredSuite,
    faqs,
    editorsPicksTemplate,
    products,
    packages,
  ] = await Promise.all([
    draftMode(),
    loadInvitationsHeroContent(),
    loadInvitationsFeaturesContent(),
    loadInvitationsFeaturedSuiteContent(),
    loadInvitationsFaqsContent(),
    loadInvitationsEditorsPicksContent(),
    loadInvitationProducts(),
    loadPackagesContent(),
  ])
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
        hero={hero}
        features={features}
        featuredSuite={featuredSuite}
        faqs={faqs}
        editorsPicks={editorsPicks}
        fromGuestPrice={fromGuestPrice}
        testimonials={<InvitationShowcase />}
      />
    </>
  )
}
