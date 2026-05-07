import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { userId } = await auth()
  const [state, userRow] = await Promise.all([
    getCurrentVendor(),
    userId ? fetchUserRow(userId) : null,
  ])

  const vendor = state.kind === 'live' ? state.vendor : null

  return (
    <SettingsClient
      phone={userRow?.phone ?? null}
      vendor={vendor}
    />
  )
}

async function fetchUserRow(clerkId: string) {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('users')
    .select('phone')
    .eq('clerk_id', clerkId)
    .maybeSingle<{ phone: string | null }>()
  return data
}
