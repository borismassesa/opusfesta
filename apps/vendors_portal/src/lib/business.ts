'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from './supabase'
import { ACTIVE_VENDOR_COOKIE } from './vendor-cookie'

/**
 * Switch the portal to another of the caller's vendor businesses.
 *
 * Verifies the caller actually holds an active membership on the requested
 * vendor before persisting the choice — the cookie is client-suppliable, so
 * both this action and getCurrentVendor() treat it as a *preference*, never
 * as authorization. Redirects to the portal root, which re-routes to either
 * the dashboard or /pending depending on the selected business's status.
 */
export async function setActiveBusiness(vendorId: string): Promise<void> {
  const { userId } = await auth()
  if (!userId || !vendorId) redirect('/')

  const admin = createSupabaseAdminClient()
  const userRow = await admin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle<{ id: string }>()
  if (userRow.error || !userRow.data) redirect('/')

  const membership = await admin
    .from('vendor_memberships')
    .select('id')
    .eq('user_id', userRow.data.id)
    .eq('vendor_id', vendorId)
    .eq('status', 'active')
    .maybeSingle<{ id: string }>()
  if (membership.error || !membership.data) redirect('/')

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_VENDOR_COOKIE, vendorId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect('/')
}
