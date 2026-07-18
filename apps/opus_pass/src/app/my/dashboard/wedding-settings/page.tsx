import { SettingsShell } from '@/components/dashboard/SettingsNav'
import { getCoupleProfile } from '@/lib/dashboard/queries'
import WeddingSettingsForm from './WeddingSettingsForm'

export const dynamic = 'force-dynamic'

export default async function WeddingSettingsPage() {
  const profile = await getCoupleProfile()
  return (
    <SettingsShell>
      <WeddingSettingsForm profile={profile} />
    </SettingsShell>
  )
}
