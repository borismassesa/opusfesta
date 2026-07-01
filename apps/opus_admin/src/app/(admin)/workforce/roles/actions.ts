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
    throw new Error(error.message || 'Could not create this role.')
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
  if (fetchError) throw new Error(fetchError.message || 'Could not load this role.')
  if (existing.is_system) {
    throw new Error('System roles cannot be edited. Clone the role to customise.')
  }

  const { error } = await supabase
    .from('workforce_roles')
    .update({ permission_keys: perms })
    .eq('id', id)
  if (error) throw new Error(error.message || 'Could not save permissions.')
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
  if (fetchError) throw new Error(fetchError.message || 'Could not load the source role.')

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
  if (error) throw new Error(error.message || 'Could not duplicate this role.')

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
  if (fetchError) throw new Error(fetchError.message || 'Could not load this role.')
  if (existing.is_system) {
    throw new Error('System roles cannot be deleted.')
  }
  const { error } = await supabase.from('workforce_roles').delete().eq('id', id)
  if (error) throw new Error(error.message || 'Could not delete this role.')
  revalidatePath('/workforce/roles')
}

export async function setRoleMembers(
  roleId: string,
  employeeIds: string[],
): Promise<void> {
  await requireAdminRole(['owner', 'admin'])

  const supabase = createSupabaseAdminClient()
  const desired = new Set(employeeIds)

  // "Holding a role" comes from two places — a PRIMARY assignment
  // (workforce_employees.dashboard_role_id, one per employee) or a
  // SECONDARY membership (workforce_role_members, many-to-many). The
  // "Assign members" modal now pre-checks the union of both (see
  // getAllRoleMembers in _lib/queries.ts), so saving must be able to
  // revoke access via whichever mechanism actually granted it — previously
  // this only ever touched workforce_role_members, so unchecking someone
  // whose access came from their primary role silently did nothing.
  const [{ data: current, error: fetchError }, { data: employees, error: employeesError }] = await Promise.all([
    supabase
      .from('workforce_role_members')
      .select('employee_id')
      .eq('role_id', roleId)
      .returns<Array<{ employee_id: string }>>(),
    supabase
      .from('workforce_employees')
      .select('id, full_name, dashboard_role_id')
      .returns<Array<{ id: string; full_name: string; dashboard_role_id: string | null }>>(),
  ])
  if (fetchError) throw new Error(fetchError.message || 'Could not load current members.')
  if (employeesError) throw new Error(employeesError.message || 'Could not load employees.')

  const existingSecondary = new Set((current ?? []).map((r) => r.employee_id))
  const dashboardRoleById = new Map((employees ?? []).map((e) => [e.id, e.dashboard_role_id]))
  const nameById = new Map((employees ?? []).map((e) => [e.id, e.full_name]))
  const primaryHolders = new Set((employees ?? []).filter((e) => e.dashboard_role_id === roleId).map((e) => e.id))
  const existing = new Set([...existingSecondary, ...primaryHolders])

  const toAdd = [...desired].filter((id) => !existing.has(id))
  const toRemove = [...existing].filter((id) => !desired.has(id))

  // Newly checked, no primary role yet → make this their primary role
  // (matches "should hold this role" without a redundant secondary row).
  // Newly checked, already has a DIFFERENT primary role → add as a
  // secondary membership instead; permissions union, and this never
  // demotes an existing primary assignment (e.g. an Owner staying Owner).
  const toAddAsPrimary = toAdd.filter((id) => !dashboardRoleById.get(id))
  const toAddAsSecondary = toAdd.filter((id) => dashboardRoleById.get(id))

  // Newly unchecked, only ever a secondary membership → remove that row.
  const toRemoveSecondary = toRemove.filter((id) => existingSecondary.has(id) && !primaryHolders.has(id))

  // Newly unchecked, this WAS their primary role → CANNOT be done here.
  // workforce_employees has a check constraint (dashboard_access = false OR
  // dashboard_role_id IS NOT NULL) — every account with dashboard access
  // must have exactly one primary role, so "remove the only role" isn't a
  // valid state; it has to become a *different* role, a per-person decision
  // this bulk checkbox list can't make. Apply everything else, then report
  // this back clearly instead of silently no-oping (the bug this replaced)
  // or violating the DB constraint (the bug the first fix introduced).
  const toRemovePrimary = toRemove.filter((id) => primaryHolders.has(id))

  if (toAddAsSecondary.length > 0) {
    const { error } = await supabase
      .from('workforce_role_members')
      .insert(toAddAsSecondary.map((employee_id) => ({ role_id: roleId, employee_id })))
    if (error) throw new Error(error.message || 'Could not add members.')
  }
  if (toRemoveSecondary.length > 0) {
    const { error } = await supabase
      .from('workforce_role_members')
      .delete()
      .eq('role_id', roleId)
      .in('employee_id', toRemoveSecondary)
    if (error) throw new Error(error.message || 'Could not remove members.')
  }
  if (toAddAsPrimary.length > 0) {
    const { error } = await supabase
      .from('workforce_employees')
      .update({ dashboard_role_id: roleId })
      .in('id', toAddAsPrimary)
    if (error) throw new Error(error.message || 'Could not assign this role.')
  }

  if (toRemovePrimary.length > 0) {
    const names = toRemovePrimary.map((id) => nameById.get(id) ?? id).join(', ')
    revalidatePath('/workforce/roles')
    revalidatePath('/workforce/employees')
    throw new Error(
      `Saved the other changes. Couldn't remove this role from ${names} here — every account needs exactly one primary role. Change their role from the Employees page instead (that flow lets you pick the replacement).`,
    )
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

