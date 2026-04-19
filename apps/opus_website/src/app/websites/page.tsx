import type { Metadata } from 'next'
import ComingSoonPage from '@/components/coming-soon/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Websites — Coming Soon | OpusFesta',
  description: 'This section is not available yet.',
}

export default function WebsitesComingSoonPage() {
  return (
    <ComingSoonPage
      words={['NOT', 'LIVE', 'YET.', 'COME BACK WHEN', 'THE DOMAIN IS UP']}
      ariaLabel="Not live yet. Come back when the domain is up."
    />
  )
}
