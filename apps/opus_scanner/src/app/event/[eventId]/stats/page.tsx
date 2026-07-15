import ScannerShell from '@/components/ScannerShell'
import StatsClient from './StatsClient'

export default async function StatsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  return (
    <ScannerShell eventId={eventId}>
      <StatsClient eventId={eventId} />
    </ScannerShell>
  )
}
