import { SettingsShell } from '@/components/dashboard/SettingsNav'
import InformationForm from './InformationForm'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <SettingsShell>
      <InformationForm />
    </SettingsShell>
  )
}
