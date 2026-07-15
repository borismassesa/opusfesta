import { redirect, notFound } from 'next/navigation'
import { getAdminAccessRole, hasPermission, isAdminDashboardRole } from '@/lib/admin-auth'
import { getCoupleTier } from '../tier'
import { getCoupleForConsole, getEventsForCouple, getGuestsForCouple, getPledgesForCouple } from './queries'
import PledgeConsole from './PledgeConsole'

export const dynamic = 'force-dynamic'

export default async function PledgeConsolePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ event?: string }>
}) {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  if (!(await hasPermission('opuspass.pledges.read'))) redirect('/')

  const { userId } = await params
  const { event: eventFilter } = await searchParams

  const [tier, couple] = await Promise.all([getCoupleTier(userId), getCoupleForConsole(userId)])
  if (!tier || !couple) notFound()

  const [events, guests, pledges, canWrite] = await Promise.all([
    getEventsForCouple(userId),
    getGuestsForCouple(userId),
    getPledgesForCouple(userId, eventFilter),
    hasPermission('opuspass.pledges.write'),
  ])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PledgeConsole
        userId={userId}
        tier={tier}
        couple={couple}
        events={events}
        guests={guests}
        pledges={pledges}
        eventFilter={eventFilter ?? null}
        canWrite={canWrite}
      />
    </div>
  )
}
