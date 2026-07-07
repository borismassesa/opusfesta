import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [state, userRow] = await Promise.all([
    getCurrentVendor(),
    fetchUserRow(userId),
  ])

  const vendor = state.kind === 'live' ? state.vendor : null
  const locale = await getLocale()
  const settingsStrings = await loadPortalUiStrings('settings', locale)

  return (
    <PortalUIStringsProvider bundles={{ settings: settingsStrings }}>
      <SettingsClient
        phone={userRow?.phone ?? null}
        vendor={vendor}
      />
    </PortalUIStringsProvider>
  )
}

async function fetchUserRow(clerkId: string) {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('phone')
    .eq('clerk_id', clerkId)
    .maybeSingle<{ phone: string | null }>()
  if (error) console.error('[settings] user row fetch failed', error.code)
  return data
}
