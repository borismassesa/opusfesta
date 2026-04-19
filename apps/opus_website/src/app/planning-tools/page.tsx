import type { Metadata } from 'next'
import ComingSoonPage from '@/components/coming-soon/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Planning Tools — Coming Soon | OpusFesta',
  description: 'This section is not available yet.',
}

export default function PlanningToolsComingSoonPage() {
  return (
    <ComingSoonPage
      words={['NOT', 'BUILT', 'YET.', 'COME BACK WHEN', 'THE TOOLS ARE READY']}
      ariaLabel="Not built yet. Come back when the tools are ready."
    />
  )
}
