'use server'

import { revalidatePath } from 'next/cache'
import { clerkClient } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  getCallerEmail,
  requireAdminRole,
  requirePermission,
  type AdminAccessRole,
} from '@/lib/admin-auth'
import { revokeInvitation as revokeWorkforceInvitation } from '@/lib/workforce-invitations'
import {
  grantDashboardAccess as grantDashboardAccessAction,
} from '../employees/actions'
import { PERMISSIONS } from '../_lib/types'

const PERMISSION_KEYS = new Set(PERMISSIONS.map((p) => p.key))

// ---------------------------------------------------------------------------
// Workforce roles — custom RBAC catalog over workforce_roles + role_members
// ---------------------------------------------------------------------------

function sanitizeSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
    .slice(0, 64)
}

function validatePermissionKeys(keys: string[]): string[] {
  const unique = Array.from(new Set(keys))
  for (const k of unique) {
    if (!PERMISSION_KEYS.has(k)) throw new Error(`Unknown permission key: ${k}`)
  }
  return unique
}

export async function createRole(input: {
  name: string
  description?: string
  permissionKeys: string[]
}): Promise<{ id: string }> {
  await requireAdminRole(['owner', 'admin'])

  const name = input.name.trim()
  if (name.length < 2) throw new Error('Role name is required.')
  const slug = sanitizeSlug(name)
  if (!slug) throw new Error('Role name must contain letters or digits.')
  const perms = validatePermissionKeys(input.permissionKeys)

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_roles')
    .insert({
      slug,
      name,
      description: input.description?.trim() ?? '',
      permission_keys: perms,
      is_system: false,
    })
    .select('id')
    .single<{ id: string }>()
  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new Error('A role with that name already exists.')
    }
    throw error
  }
  revalidatePath('/workforce/roles')
  return { id: data.id }
}

export async function updateRolePermissions(id: string, permissionKeys: string[]): Promise<void> {
  await requireAdminRole(['owner', 'admin'])
  const perms = validatePermissionKeys(permissionKeys)

  const supabase = createSupabaseAdminClient()
  // System roles are locked — protect against accidental edits via the UI.
  const { data: existing, error: fetchError } = await supabase
    .from('workforce_roles')
    .select('is_system, slug')
    .eq('id', id)
    .single<{ is_system: boolean; slug: string }>()
  if (fetchError) throw fetchError
  if (existing.is_system) {
    throw new Error('System roles cannot be edited. Clone the role to customise.')
  }

  const { error } = await supabase
    .from('workforce_roles')
    .update({ permission_keys: perms })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/workforce/roles')
}

export async function duplicateRole(id: string): Promise<{ id: string }> {
  // Clone an existing role (typically a system role) into a brand-new
  // custom role. Lets admins start from a sensible baseline ("copy Admin,
  // remove Finance write") instead of building from scratch.
  await requireAdminRole(['owner', 'admin'])

  const supabase = createSupabaseAdminClient()
  const { data: source, error: fetchError } = await supabase
    .from('workforce_roles')
    .select('name, description, permission_keys')
    .eq('id', id)
    .single<{ name: string; description: string; permission_keys: string[] }>()
  if (fetchError) throw fetchError

  // Append " (copy)" — bump to "(copy 2)" / "(copy 3)" if there's a name
  // collision so duplicating twice doesn't fail.
  const baseName = `${source.name} (copy)`
  let name = baseName
  let attempt = 2
  while (attempt < 20) {
    const slug = sanitizeSlug(name)
    const { count } = await supabase
      .from('workforce_roles')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug)
    if (!count) break
    name = `${source.name} (copy ${attempt++})`
  }

  const slug = sanitizeSlug(name)
  const { data, error } = await supabase
    .from('workforce_roles')
    .insert({
      slug,
      name,
      description: source.description,
      permission_keys: source.permission_keys,
      is_system: false,
    })
    .select('id')
    .single<{ id: string }>()
  if (error) throw error

  revalidatePath('/workforce/roles')
  return { id: data.id }
}

export async function deleteRole(id: string): Promise<void> {
  await requireAdminRole(['owner'])
  const supabase = createSupabaseAdminClient()
  const { data: existing, error: fetchError } = await supabase
    .from('workforce_roles')
    .select('is_system')
    .eq('id', id)
    .single<{ is_system: boolean }>()
  if (fetchError) throw fetchError
  if (existing.is_system) {
    throw new Error('System roles cannot be deleted.')
  }
  const { error } = await supabase.from('workforce_roles').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/workforce/roles')
}

export async function setRoleMembers(
  roleId: string,
  employeeIds: string[],
): Promise<void> {
  await requireAdminRole(['owner', 'admin'])

  const supabase = createSupabaseAdminClient()
  const desired = new Set(employeeIds)

  const { data: current, error: fetchError } = await supabase
    .from('workforce_role_members')
    .select('employee_id')
    .eq('role_id', roleId)
    .returns<Array<{ employee_id: string }>>()
  if (fetchError) throw fetchError
  const existing = new Set((current ?? []).map((r) => r.employee_id))

  // Diff and apply — only insert what's new and delete what's been
  // removed. This avoids touching unchanged rows so the trigger fires
  // the minimum number of times for the members_count refresh.
  const toAdd = [...desired].filter((id) => !existing.has(id))
  const toRemove = [...existing].filter((id) => !desired.has(id))

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from('workforce_role_members')
      .insert(toAdd.map((employee_id) => ({ role_id: roleId, employee_id })))
    if (error) throw error
  }
  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('workforce_role_members')
      .delete()
      .eq('role_id', roleId)
      .in('employee_id', toRemove)
    if (error) throw error
  }

  revalidatePath('/workforce/roles')
  revalidatePath('/workforce/employees')
}

// ---------------------------------------------------------------------------
// Admin team — manages admin_whitelist, the source of truth for dashboard
// access. Moved here from /operations/admins so the entire "who can use
// this dashboard" surface lives next to the workforce role catalog.
// ---------------------------------------------------------------------------

const ASSIGNABLE_ADMIN_ROLES: AdminAccessRole[] = [
  'owner',
  'admin',
  'editor',
  'author',
  'viewer',
]

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function ensureAssignableAdminRole(role: string): AdminAccessRole {
  const normalized = role.trim().toLowerCase() as AdminAccessRole
  if (!ASSIGNABLE_ADMIN_ROLES.includes(normalized)) {
    throw new Error(`Role must be one of: ${ASSIGNABLE_ADMIN_ROLES.join(', ')}`)
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
    console.warn('[workforce/roles admin-team] could not sync Clerk role', {
      email,
      error,
    })
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
  const role = ensureAssignableAdminRole(input.role)
  const fullName = input.fullName.trim() || null

  const supabase = createSupabaseAdminClient()

  // Plain insert (not upsert) so the last-active-owner / self-lockout guards
  // can't be bypassed by silently mutating an existing row from this dialog.
  const { data, error } = await supabase
    .from('admin_whitelist')
    .insert({ email, full_name: fullName, role, is_active: true })
    .select('id')
    .single<{ id: string }>()

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new Error(
        `${email} is already on the admin team. Use the role and status controls on their row to update them.`
      )
    }
    throw error
  }

  await syncClerkRoleByEmail(email, role)
  revalidatePath('/workforce/roles')
  return { id: data.id }
}

export async function updateAdminRole(id: string, role: string): Promise<void> {
  await requireAdminRole(['owner'])
  const next = ensureAssignableAdminRole(role)

  const supabase = createSupabaseAdminClient()
  const { data: existing, error: fetchError } = await supabase
    .from('admin_whitelist')
    .select('email, role, is_active')
    .eq('id', id)
    .single<{ email: string; role: AdminAccessRole; is_active: boolean }>()
  if (fetchError) throw fetchError

  if (existing.role === 'owner' && next !== 'owner' && existing.is_active) {
    await assertOtherActiveOwnerExists(id)
  }

  const { error } = await supabase
    .from('admin_whitelist')
    .update({ role: next })
    .eq('id', id)
  if (error) throw error

  await syncClerkRoleByEmail(existing.email, next)
  revalidatePath('/workforce/roles')
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

  await syncClerkRoleByEmail(existing.email, isActive ? existing.role : null)
  revalidatePath('/workforce/roles')
}

// ---------------------------------------------------------------------------
// Workforce invitations — pending-invitations panel actions
// ---------------------------------------------------------------------------

export async function revokeWorkforceInvitationAction(invitationId: string): Promise<void> {
  await requirePermission('platform.admin')
  await revokeWorkforceInvitation(invitationId)
  revalidatePath('/workforce/roles')
  revalidatePath('/workforce/employees')
}

export async function resendWorkforceInvitationAction(
  employeeId: string,
  roleId: string,
): Promise<{ emailSent: boolean; emailReason?: string }> {
  // grantDashboardAccess already gates on platform.admin and revokes any
  // existing pending invitation before creating a fresh one — so calling
  // it again is a "resend" semantically.
  const result = await grantDashboardAccessAction(employeeId, roleId)
  return { emailSent: result.emailSent, emailReason: result.emailReason }
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
  revalidatePath('/workforce/roles')
}
