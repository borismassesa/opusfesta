import type { Metadata } from 'next'
import AdviceIdeasIndexPage from '@/components/advice-ideas/AdviceIdeasIndexPage'

export const metadata: Metadata = {
  title: 'Advice & Ideas | OpusFesta',
  description:
    'Real weddings, planning guides, style notes, and hosting ideas curated in the OpusFesta editorial style.',
}

export default function AdviceIdeasPage() {
  return <AdviceIdeasIndexPage />
}
