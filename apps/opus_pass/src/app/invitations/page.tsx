import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { PreviewBanner } from '@/components/PreviewBanner'
import { loadInvitationsHeroContent } from '@/lib/cms/invitations-hero'
import { loadInvitationsFeaturesContent } from '@/lib/cms/invitations-features'
import { loadInvitationsFeaturedSuiteContent } from '@/lib/cms/invitations-featured-suite'
import { loadInvitationsFaqsContent } from '@/lib/cms/invitations-faqs'
import { loadInvitationsEditorsPicksContent } from '@/lib/cms/invitations-editors-picks'
import { InvitationShowcase } from '@/components/home/InvitationShowcase'
import InvitationsLandingClient from './InvitationsLandingClient'

export const metadata: Metadata = {
  title: 'Wedding Invitations | OpusPass',
  description:
    'Wedding invitations, save the dates, RSVPs and thank yous designed for Tanzanian weddings. Bilingual wording, free wedding website, free RSVP page.',
}

export default async function InvitationsLandingPage() {
  const [{ isEnabled: isDraft }, hero, features, featuredSuite, faqs, editorsPicks] =
    await Promise.all([
      draftMode(),
      loadInvitationsHeroContent(),
      loadInvitationsFeaturesContent(),
      loadInvitationsFeaturedSuiteContent(),
      loadInvitationsFaqsContent(),
      loadInvitationsEditorsPicksContent(),
    ])
  return (
    <>
      {isDraft && <PreviewBanner />}
      <InvitationsLandingClient
        hero={hero}
        features={features}
        featuredSuite={featuredSuite}
        faqs={faqs}
        editorsPicks={editorsPicks}
        testimonials={<InvitationShowcase />}
      />
    </>
  )
}
