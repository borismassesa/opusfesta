import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { PreviewBanner } from '@/components/PreviewBanner'
import { InvitationShowcase } from '@/components/home/InvitationShowcase'
import GuestsLandingClient from './GuestsLandingClient'

export const metadata: Metadata = {
  title: 'Guests & RSVPs | OpusPass',
  description:
    'Send digital wedding invitations by WhatsApp or SMS and watch RSVPs roll in live. Manage your guest list, track replies in English and Swahili, and plan your seating chart — all in one place.',
}

export default async function GuestsLandingPage() {
  const { isEnabled: isDraft } = await draftMode()
  return (
    <>
      {isDraft && <PreviewBanner />}
      <GuestsLandingClient testimonials={<InvitationShowcase />} />
    </>
  )
}
