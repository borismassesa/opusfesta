import {
  getPledges,
  getPledgeStats,
  getGuestsWithInvitations,
  getCoupleProfile,
  coupleDisplayName,
  getMyPledgeToken,
} from '@/lib/dashboard/queries'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { loadDashboardCopy } from '@/lib/cms/dashboard-copy'
import PledgesManager from './PledgesManager'

export const dynamic = 'force-dynamic'

export default async function PledgesPage() {
  const [pledges, stats, guests, profile, hero, pledgeToken, copy] = await Promise.all([
    getPledges(),
    getPledgeStats(),
    getGuestsWithInvitations(),
    getCoupleProfile(),
    loadDashboardHero('pledges'),
    getMyPledgeToken(),
    loadDashboardCopy('pledges'),
  ])
  return (
    <PledgesManager
      initialPledges={pledges}
      stats={stats}
      contacts={guests.map((g) => ({
        id: g.id,
        full_name: g.full_name,
        phone: g.phone,
        whatsapp_phone: g.whatsapp_phone,
        email: g.email,
      }))}
      coupleName={coupleDisplayName(profile)}
      paymentInstructions={profile?.pledge_payment_instructions ?? null}
      paymentMethods={profile?.pledge_payment_methods ?? []}
      goalAmount={profile?.pledge_goal_amount ?? null}
      weddingDate={profile?.wedding_date ?? null}
      hero={hero}
      pledgeToken={pledgeToken}
      copy={copy}
    />
  )
}
