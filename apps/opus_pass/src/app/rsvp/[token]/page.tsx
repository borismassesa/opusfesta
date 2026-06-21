import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicRsvpData } from '@/lib/dashboard/queries'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import { UIStringsProvider } from '@/components/providers/UIStringsProvider'
import PublicRsvpForm from './PublicRsvpForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "You're invited — OpusPass",
  robots: { index: false, follow: false },
}

export default async function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const data = await getPublicRsvpData(token)
  if (!data) notFound()
  const locale = await getLocale()
  const formsRsvp = await loadUiStrings('forms-rsvp', locale)
  return (
    <UIStringsProvider bundles={{ 'forms-rsvp': formsRsvp }}>
      <PublicRsvpForm data={data} token={token} />
    </UIStringsProvider>
  )
}
