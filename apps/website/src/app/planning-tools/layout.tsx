import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planning Tools | OpusFesta',
  description:
    'Plan your wedding with clarity. Checklist, budget advisor, style quiz, vendor coordination, and timeline — all connected in one workspace.',
  openGraph: {
    title: 'Planning Tools | OpusFesta',
    description:
      'Plan your wedding with clarity. Checklist, budget advisor, style quiz, vendor coordination, and timeline — all connected in one workspace.',
    type: 'website',
  },
}

export default function PlanningToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
