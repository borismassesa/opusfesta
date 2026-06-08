import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { PreviewBanner } from '@/components/PreviewBanner'
import { InvitationShowcase } from '@/components/home/InvitationShowcase'
import { loadGuestsHeroContent } from '@/lib/cms/guests-hero'
import { loadGuestsFeaturesContent } from '@/lib/cms/guests-features'
import { loadGuestsSpreadContent } from '@/lib/cms/guests-spread-the-joy'
import { loadGuestsFaqsContent } from '@/lib/cms/guests-faqs'
import { loadGuestsTestimonialsContent } from '@/lib/cms/guests-testimonials'
import GuestsLandingClient from './GuestsLandingClient'

export const metadata: Metadata = {
  title: 'Guests & RSVPs | OpusPass',
  description:
    'Send digital wedding invitations by WhatsApp or SMS and watch RSVPs roll in live. Manage your guest list, track replies in English and Swahili, and plan your seating chart — all in one place.',
}

export default async function GuestsLandingPage() {
  const { isEnabled: isDraft } = await draftMode()
  const [hero, features, spread, faqs, testimonials] = await Promise.all([
    loadGuestsHeroContent(),
    loadGuestsFeaturesContent(),
    loadGuestsSpreadContent(),
    loadGuestsFaqsContent(),
    loadGuestsTestimonialsContent(),
  ])
  return (
    <>
      {isDraft && <PreviewBanner />}
      <GuestsLandingClient
        hero={hero}
        features={features}
        spread={spread}
        faqs={faqs}
        testimonials={<InvitationShowcase content={testimonials} />}
      />
    </>
  )
}
