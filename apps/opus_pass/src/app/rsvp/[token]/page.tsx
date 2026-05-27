import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicRsvpData } from '@/lib/dashboard/queries'
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
  return <PublicRsvpForm data={data} token={token} />
}
