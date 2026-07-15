import ScannerShell from '@/components/ScannerShell'
import GuestsClient from './GuestsClient'

export default async function GuestsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  return (
    <ScannerShell eventId={eventId}>
      <GuestsClient eventId={eventId} />
    </ScannerShell>
  )
}
