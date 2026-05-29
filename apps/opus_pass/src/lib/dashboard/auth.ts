import 'server-only'
import { randomUUID } from 'node:crypto'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createDashboardClient } from './supabase'

export interface DashboardUser {
  /** public.users.id used to scope every dashboard query */
  id: string
  clerkId: string
  email: string | null
  name: string | null
}

/**
 * Resolves the signed-in Clerk user to a row in public.users, provisioning one
 * if the Clerk sync webhook hasn't created it yet. Mirrors the webhook's insert
 * shape so the dashboard works the first time a couple signs in.
 *
 * Returns null when there is no signed-in user. Callers under /my can assume a
 * user (the middleware enforces auth) and use requireDashboardUser().
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
    return { id: existing.id, clerkId: existing.clerk_id, email: existing.email, name: existing.name }
  }

  // Provision a row from the Clerk identity (webhook fallback).
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
        password: '$2a$10$placeholder_password_not_used_with_clerk_auth',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_id' }
    )
    .select('id, clerk_id, email, name')
    .single<{ id: string; clerk_id: string; email: string | null; name: string | null }>()

  if (error || !inserted) {
    // Only adopt a pre-existing row on a genuine email unique-violation (23505).
    // Clerk verifies the email before sign-in, so this safely links a Clerk
    // identity to a user provisioned earlier (e.g. by the marketplace app).
    // Other insert errors must surface, not silently rebind an unrelated row.
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
        return { id: byEmail.id, clerkId: byEmail.clerk_id, email: byEmail.email, name: byEmail.name }
      }
    }
    throw new Error(`Failed to provision dashboard user: ${error?.message ?? 'unknown error'}`)
  }

  return { id: inserted.id, clerkId: inserted.clerk_id, email: inserted.email, name: inserted.name }
}

export async function requireDashboardUser(): Promise<DashboardUser> {
  const user = await getDashboardUser()
  if (!user) throw new Error('Not authenticated')
  return user
}
