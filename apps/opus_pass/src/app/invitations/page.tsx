import type { Metadata } from 'next'
import InvitationsLandingClient from './InvitationsLandingClient'

export const metadata: Metadata = {
  title: 'Wedding Invitations | OpusFesta',
  description:
    'Wedding invitations, save the dates, RSVPs and thank yous designed for Tanzanian weddings. Bilingual wording, free wedding website, free RSVP page.',
}

export default function InvitationsLandingPage() {
  return <InvitationsLandingClient />
}
