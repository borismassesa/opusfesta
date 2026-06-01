import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { PreviewBanner } from '@/components/PreviewBanner'
import { loadWebsitesHeroContent } from '@/lib/cms/websites-hero'
import { loadWebsitesDesignsContent } from '@/lib/cms/websites-designs'
import { loadWebsitesSellingPointsContent } from '@/lib/cms/websites-selling-points'
import { loadWebsitesFeaturesContent } from '@/lib/cms/websites-features'
import { loadWebsitesFaqsContent } from '@/lib/cms/websites-faqs'
import { InvitationShowcase } from '@/components/home/InvitationShowcase'
import WebsitesLandingClient from './WebsitesLandingClient'

export const metadata: Metadata = {
  title: 'Wedding Websites | OpusPass',
  description:
    'Build a free wedding website in minutes with OpusPass. Beautiful designs, bilingual RSVPs, registry links and live guest updates — all in one place.',
}

export default async function WebsitesLandingPage() {
  const [{ isEnabled: isDraft }, hero, designs, sellingPoints, features, faqs] =
    await Promise.all([
      draftMode(),
      loadWebsitesHeroContent(),
      loadWebsitesDesignsContent(),
      loadWebsitesSellingPointsContent(),
      loadWebsitesFeaturesContent(),
      loadWebsitesFaqsContent(),
    ])
  return (
    <>
      {isDraft && <PreviewBanner />}
      <WebsitesLandingClient
        hero={hero}
        designs={designs}
        sellingPoints={sellingPoints}
        features={features}
        faqs={faqs}
        testimonials={<InvitationShowcase />}
      />
    </>
  )
}
