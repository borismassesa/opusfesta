import type { Metadata } from 'next'
import ComingSoonPage from '@/components/coming-soon/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Guests & RSVPs — Coming Soon | OpusFesta',
  description: 'This section is not available yet.',
}

export default function GuestsComingSoonPage() {
  return (
    <ComingSoonPage
      words={['NOT', 'LISTED', 'YET.', 'COME BACK WHEN', 'THE INVITES GO OUT']}
      ariaLabel="Not listed yet. Come back when the invites go out."
    />
  )
}
