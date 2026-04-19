import type { Metadata } from 'next'
import ComingSoonPage from '@/components/coming-soon/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Attire & Rings — Coming Soon | OpusFesta',
  description: 'This section is not available yet.',
}

export default function AttireAndRingsComingSoonPage() {
  return (
    <ComingSoonPage
      words={['NOT', 'FITTED', 'YET.', 'COME BACK WHEN', 'THE ATELIER OPENS']}
      ariaLabel="Not fitted yet. Come back when the atelier opens."
    />
  )
}
