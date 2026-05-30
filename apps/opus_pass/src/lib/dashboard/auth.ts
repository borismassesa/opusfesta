import 'server-only'
import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createDashboardClient } from './supabase'

export interface DashboardUser {
  /** public.users.id used to scope every dashboard query */
  id: string
  /** Clerk identity id (auth.userId) */
  clerkId: string
  email: string
  name: string | null
}

/**
 * Resolves the signed-in Clerk user to a row in public.users, provisioning
 * one if the Clerk sync webhook hasn't run yet. Returns null when no Clerk
 * session is present.
 *
 * The 23505 (unique violation) branch lets a Clerk identity adopt a
 * pre-existing row when the email collides — needed because the marketplace
 * app may have provisioned the row from an earlier sign-up. Other insert
 * errors propagate so they don't silently rebind unrelated rows.
 */
export async function getDashboardUser(): Promise<DashboardUser | null> {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createDashboardClient()

  const { data: existing } = await supabase
    .from('users')
    .select('id, clerk_id, email, name')
    .eq('clerk_id', userId)
    .maybeSingle<{ id: string; clerk_id: string; email: string | null; name: string | null }>()

  if (existing) {
    return {
      id: existing.id,
      clerkId: existing.clerk_id,
      email: existing.email ?? '',
      name: existing.name,
    }
  }

  const clerk = await currentUser()
  const email =
    clerk?.primaryEmailAddress?.emailAddress ??
    clerk?.emailAddresses?.[0]?.emailAddress ??
    null
  const name = [clerk?.firstName, clerk?.lastName].filter(Boolean).join(' ') || null

  const { data: inserted, error } = await supabase
    .from('users')
    .upsert(
      {
        id: randomUUID(),
        clerk_id: userId,
        email,
        name,
        avatar: clerk?.imageUrl ?? null,
        role: 'user',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_id' },
    )
    .select('id, clerk_id, email, name')
    .single<{ id: string; clerk_id: string; email: string | null; name: string | null }>()

  if (inserted) {
    return {
      id: inserted.id,
      clerkId: inserted.clerk_id,
      email: inserted.email ?? '',
      name: inserted.name,
    }
  }

  const isEmailConflict =
    (error as { code?: string } | null)?.code === '23505' &&
    (error?.message?.includes('email') ?? false)
  if (email && isEmailConflict) {
    const { data: byEmail } = await supabase
      .from('users')
      .update({ clerk_id: userId, updated_at: new Date().toISOString() })
      .eq('email', email)
      .select('id, clerk_id, email, name')
      .maybeSingle<{ id: string; clerk_id: string; email: string | null; name: string | null }>()
    if (byEmail) {
      return {
        id: byEmail.id,
        clerkId: byEmail.clerk_id,
        email: byEmail.email ?? '',
        name: byEmail.name,
      }
    }
  }

  console.error('[dashboard auth] failed to provision Clerk user', error)
  return null
}

/**
 * Guard for /my/* routes. Redirects to /sign-in (preserving return_to) when
 * the Clerk session is missing or the public.users row couldn't be resolved.
 * Middleware already enforces auth above /my, so this is belt-and-suspenders.
 */
export async function requireDashboardUser(returnTo?: string): Promise<DashboardUser> {
  const user = await getDashboardUser()
  if (user) return user
  const params = new URLSearchParams()
  if (returnTo) params.set('redirect_url', returnTo)
  const query = params.toString()
  redirect(`/sign-in${query ? `?${query}` : ''}`)
}
