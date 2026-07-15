import ScannerShell from '@/components/ScannerShell'
import ScanClient from './ScanClient'

export default async function ScanPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  return (
    <ScannerShell eventId={eventId}>
      <ScanClient eventId={eventId} />
    </ScannerShell>
  )
}
