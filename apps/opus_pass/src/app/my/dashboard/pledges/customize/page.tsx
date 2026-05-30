import { getMyPledgeToken, getMyPledgePageConfig } from '@/lib/dashboard/queries'
import PledgeCustomizeClient from './PledgeCustomizeClient'

export const dynamic = 'force-dynamic'

export default async function PledgeCustomizePage() {
  const [pledgeToken, pageConfig] = await Promise.all([getMyPledgeToken(), getMyPledgePageConfig()])
  return <PledgeCustomizeClient pledgeToken={pledgeToken} initialConfig={pageConfig} />
}
