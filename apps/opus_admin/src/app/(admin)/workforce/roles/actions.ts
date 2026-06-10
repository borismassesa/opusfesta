'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  requireAdminRole,
  requirePermission,
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

