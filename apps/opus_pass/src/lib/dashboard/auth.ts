import 'server-only'
import { createDashboardClient } from './supabase'

export interface DashboardUser {
  /** public.users.id used to scope every dashboard query */
  id: string
  email: string
  name: string | null
}

// Auth has been intentionally disabled — the dashboard is open to anyone
// visiting /my/dashboard and they all share one demo couple. Every request
// resolves to the same DEMO_USER row, lazy-provisioned on first call.
//
// If multi-tenant sign-in comes back, replace these helpers with real session
// reads (e.g. via createSupabaseAuthClient) and drop the upsert here.
const DEMO_USER_ID = '00000000-0000-0000-0000-00000000d3a1'
const DEMO_USER: DashboardUser = {
  id: DEMO_USER_ID,
  email: 'demo@opusfesta.com',
  name: 'Demo Couple',
}

let provisioned = false

async function ensureDemoUserExists(): Promise<void> {
  if (provisioned) return
  const admin = createDashboardClient()
  const { error } = await admin
    .from('users')
    .upsert(
      { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name },
      { onConflict: 'id', ignoreDuplicates: true },
    )
  if (error) {
    console.error('[dashboard auth] failed to provision demo user', error)
    return
  }
  provisioned = true
}

export async function getDashboardUser(): Promise<DashboardUser> {
  await ensureDemoUserExists()
  return DEMO_USER
}

export async function requireDashboardUser(_returnTo?: string): Promise<DashboardUser> {
  return getDashboardUser()
}
