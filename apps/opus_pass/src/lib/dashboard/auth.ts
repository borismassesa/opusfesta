import 'server-only'
import { redirect } from 'next/navigation'
import { createSupabaseAuthClient } from '@/lib/supabase-server'
import { createDashboardClient } from './supabase'

export interface DashboardUser {
  /** public.users.id — matches auth.users.id for Supabase-auth couples */
  id: string
  email: string
  name: string | null
}

/** Read the current Supabase session and ensure a matching public.users row exists. */
export async function getDashboardUser(): Promise<DashboardUser | null> {
  const supabase = await createSupabaseAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const email = user.email ?? null
  if (!email) return null

  const name =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    null

  // Lazy-provision public.users with id = auth.users.id so RLS via
  // `requesting_user_id() = user_id` (auth.uid() fallback path) lines up.
  // Service-role client bypasses RLS for this bootstrap insert.
  const admin = createDashboardClient()
  const { error } = await admin
    .from('users')
    .upsert(
      { id: user.id, email, name },
      { onConflict: 'id', ignoreDuplicates: false },
    )
  if (error) {
    console.error('[dashboard auth] failed to upsert public.users', error)
    return null
  }

  return { id: user.id, email, name }
}

export async function requireDashboardUser(returnTo?: string): Promise<DashboardUser> {
  const user = await getDashboardUser()
  if (user) return user
  const params = new URLSearchParams()
  if (returnTo) params.set('return_to', returnTo)
  const query = params.toString()
  redirect(`/sign-in${query ? `?${query}` : ''}`)
}
