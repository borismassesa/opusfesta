import { getMyCollectorToken, getMyCollectorPageConfig } from '@/lib/dashboard/queries'
import CollectorCustomizeClient from './CollectorCustomizeClient'

export const dynamic = 'force-dynamic'

export default async function CollectorCustomizePage() {
  const [collectorToken, pageConfig] = await Promise.all([
    getMyCollectorToken(),
    getMyCollectorPageConfig(),
  ])
  return <CollectorCustomizeClient collectorToken={collectorToken} initialConfig={pageConfig} />
}
