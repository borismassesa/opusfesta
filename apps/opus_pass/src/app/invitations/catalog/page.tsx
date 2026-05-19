import type { Metadata } from 'next'
import InvitationsCatalogClient from './InvitationsCatalogClient'

export const metadata: Metadata = {
  title: 'Wedding Invitations | OpusFesta',
  description:
    'Browse wedding invitations, save the dates, and RSVP cards. Personalise with your colours, photos, and bilingual copy — designed for Tanzanian weddings.',
}

export default function InvitationsCatalogPage() {
  return <InvitationsCatalogClient />
}
