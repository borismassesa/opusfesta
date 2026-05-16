import type { Metadata } from 'next'
import GuestsLandingClient from './GuestsLandingClient'

export const metadata: Metadata = {
  title: 'Wedding Invitations & RSVPs | OpusFesta',
  description:
    'Wedding invitations, save the dates, RSVPs and thank yous designed for Tanzanian weddings. Bilingual wording, free wedding website, free guest list.',
}

export default function GuestsLandingPage() {
  return <GuestsLandingClient />
}
