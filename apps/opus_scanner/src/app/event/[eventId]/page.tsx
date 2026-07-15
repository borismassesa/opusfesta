import EventLogin from './EventLogin'

export default async function EventLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { eventId } = await params
  const { token } = await searchParams
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <EventLogin eventId={eventId} urlToken={token ?? null} />
    </main>
  )
}
