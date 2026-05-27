import { getCoupleProfile } from '@/lib/dashboard/queries'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const profile = await getCoupleProfile()
  return <SettingsForm profile={profile} />
}
