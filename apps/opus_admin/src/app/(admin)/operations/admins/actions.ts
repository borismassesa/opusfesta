'use server'

import { revalidatePath } from 'next/cache'
import { clerkClient } from '@clerk/nextjs/server'
import {
  getCallerEmail,
  requireAdminRole,
  type AdminAccessRole,
} from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

const ASSIGNABLE_ROLES: AdminAccessRole[] = [
  'owner',
  'admin',
  'editor',
  'author',
  'viewer',
]

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function ensureAssignableRole(role: string): AdminAccessRole {
  const normalized = role.trim().toLowerCase() as AdminAccessRole
  if (!ASSIGNABLE_ROLES.includes(normalized)) {
    throw new Error(`Role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`)
  }
  return normalized
}

async function assertOtherActiveOwnerExists(excludeId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { count, error } = await supabase
    .from('admin_whitelist')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'owner')
    .eq('is_active', true)
    .neq('id', excludeId)
  if (error) throw error
  if (!count || count < 1) {
    throw new Error(
      'There must be at least one active owner. Promote another member to owner first.'
    )
  }
}

async function syncClerkRoleByEmail(
  email: string,
  desired: AdminAccessRole | null
): Promise<void> {
  try {
    const client = await clerkClient()
    const { data } = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    })
    const user = data[0]
    if (!user) return
    const next = desired ?? null
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: { ...(user.publicMetadata ?? {}), role: next },
    })
  } catch (error) {
    console.warn('[admins actions] could not sync Clerk role', { email, error })
  }
}

export type AdminWhitelistRow = {
  id: string
  email: string
  full_name: string | null
  role: AdminAccessRole
  is_active: boolean
  added_at: string
  last_login: string | null
}

export async function listAdmins(): Promise<AdminWhitelistRow[]> {
  await requireAdminRole(['owner', 'admin'])
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('admin_whitelist')
    .select('id, email, full_name, role, is_active, added_at, last_login')
    .order('is_active', { ascending: false })
    .order('role', { ascending: true })
    .order('email', { ascending: true })
  if (error) throw error
  return (data ?? []) as AdminWhitelistRow[]
}

export async function addAdmin(input: {
  email: string
  fullName: string
  role: string
}): Promise<{ id: string }> {
  await requireAdminRole(['owner'])
  const email = normalizeEmail(input.email)
  if (!email.includes('@')) throw new Error('Enter a valid email address.')
  const role = ensureAssignableRole(input.role)
  const fullName = input.fullName.trim() || null

  const supabase = createSupabaseAdminClient()

  // Use plain insert rather than upsert. An upsert would let an owner
  // change an existing member's role/status from this dialog without going
  // through updateAdminRole / setAdminActive — which means the
  // last-active-owner and self-lockout guards would be bypassed (e.g.
  // silently demoting the sole remaining owner via "Add admin"). Force
  // the caller to use the dedicated row controls; those run the checks.
  const { data, error } = await supabase
    .from('admin_whitelist')
    .insert({ email, full_name: fullName, role, is_active: true })
    .select('id')
    .single<{ id: string }>()

  if (error) {
    // 23505 = unique_violation on the email column.
    if ((error as { code?: string }).code === '23505') {
      throw new Error(
        `${email} is already on the admin team. Use the role and status controls on their row to update them.`
      )
    }
    throw error
  }

  await syncClerkRoleByEmail(email, role)
  revalidatePath('/operations/admins')
  return { id: data.id }
}

export async function updateAdminRole(id: string, role: string): Promise<void> {
  await requireAdminRole(['owner'])
  const next = ensureAssignableRole(role)

  const supabase = createSupabaseAdminClient()
  const { data: existing, error: fetchError } = await supabase
    .from('admin_whitelist')
    .select('email, role, is_active')
    .eq('id', id)
    .single<{ email: string; role: AdminAccessRole; is_active: boolean }>()
  if (fetchError) throw fetchError

  // Demoting an active owner is fine, but only if at least one other active
  // owner remains so the team can never end up locked out of admin
  // management. Promotions and lateral changes don't need this guard.
  if (existing.role === 'owner' && next !== 'owner' && existing.is_active) {
    await assertOtherActiveOwnerExists(id)
  }

  const { error } = await supabase
    .from('admin_whitelist')
    .update({ role: next })
    .eq('id', id)
  if (error) throw error

  await syncClerkRoleByEmail(existing.email, next)
  revalidatePath('/operations/admins')
}

export async function setAdminActive(id: string, isActive: boolean): Promise<void> {
  await requireAdminRole(['owner'])

  const supabase = createSupabaseAdminClient()
  const { data: existing, error: fetchError } = await supabase
    .from('admin_whitelist')
    .select('email, role, is_active')
    .eq('id', id)
    .single<{ email: string; role: AdminAccessRole; is_active: boolean }>()
  if (fetchError) throw fetchError

  // Disabling the last active owner would lock everyone out.
  if (!isActive && existing.role === 'owner' && existing.is_active) {
    await assertOtherActiveOwnerExists(id)
  }

  const callerEmail = await getCallerEmail()
  if (!isActive && callerEmail && callerEmail === existing.email) {
    throw new Error('You can’t disable your own admin access.')
  }

  const { error } = await supabase
    .from('admin_whitelist')
    .update({ is_active: isActive })
    .eq('id', id)
  if (error) throw error

  // When disabling, clear Clerk role too so cached metadata can't grant
  // dashboard access. When re-enabling, restore the whitelist role.
  await syncClerkRoleByEmail(existing.email, isActive ? existing.role : null)
  revalidatePath('/operations/admins')
}

export async function removeAdmin(id: string): Promise<void> {
  await requireAdminRole(['owner'])

  const supabase = createSupabaseAdminClient()
  const { data: existing, error: fetchError } = await supabase
    .from('admin_whitelist')
    .select('email, role, is_active')
    .eq('id', id)
    .single<{ email: string; role: AdminAccessRole; is_active: boolean }>()
  if (fetchError) throw fetchError

  const callerEmail = await getCallerEmail()
  if (callerEmail && callerEmail === existing.email) {
    throw new Error('You can’t remove yourself. Ask another owner to do it.')
  }
  if (existing.role === 'owner' && existing.is_active) {
    await assertOtherActiveOwnerExists(id)
  }

  const { error } = await supabase.from('admin_whitelist').delete().eq('id', id)
  if (error) throw error

  await syncClerkRoleByEmail(existing.email, null)
  revalidatePath('/operations/admins')
}
