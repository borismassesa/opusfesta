import type { Metadata } from 'next'
import ComingSoonPage from '@/components/coming-soon/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Advice & Ideas — Coming Soon | OpusFesta',
  description: 'This section is not available yet.',
}

export default function AdviceIdeasComingSoonPage() {
  return (
    <ComingSoonPage
      words={['NOT', 'PUBLISHED', 'YET.', 'COME BACK WHEN', 'THE INK DRIES']}
      ariaLabel="Not published yet. Come back when the ink dries."
    />
  )
}
