import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicPledgeCouple } from '@/lib/dashboard/queries'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import { UIStringsProvider } from '@/components/providers/UIStringsProvider'
import PledgeForm from './PledgeForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ event?: string }>
}

export default async function PledgePage({ params, searchParams }: PageProps) {
  const { token } = await params
  const { event: eventId } = await searchParams
  const couple = await getPublicPledgeCouple(token, eventId ?? null)
  if (!couple) notFound()
  const locale = await getLocale()
  const formsPledge = await loadUiStrings('forms-pledge', locale)
  return (
    <UIStringsProvider bundles={{ 'forms-pledge': formsPledge }}>
      <PledgeForm
        token={token}
        eventId={eventId ?? null}
        coupleName={couple.coupleName}
        weddingDate={couple.weddingDate}
        city={couple.city}
        config={couple.pageConfig}
        locale={locale}
      />
    </UIStringsProvider>
  )
}
