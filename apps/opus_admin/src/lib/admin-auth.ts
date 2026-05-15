import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import type { User } from '@clerk/nextjs/server'
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from '@/lib/supabase'
import { auditPermissionDenied, recordAuditEvent } from '@/lib/audit-log'

export type AdminAccessRole = 'owner' | 'admin' | 'editor' | 'author' | 'viewer'

const ADMIN_ACCESS_ROLES: AdminAccessRole[] = [
  'owner',
  'admin',
  'editor',
  'author',
  'viewer',
]

// Roles that are allowed to load the admin dashboard (everything under
// `(admin)/`). Authors write articles via /contribute and shouldn't see the
// admin shell — see comment in operations/articles/actions.ts.
const ADMIN_DASHBOARD_ROLES: readonly AdminAccessRole[] = [
  'owner',
  'admin',
  'editor',
  'viewer',
]

export function isAdminDashboardRole(role: AdminAccessRole | null): boolean {
  return role !== null && ADMIN_DASHBOARD_ROLES.includes(role)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeRole(value: unknown): AdminAccessRole | null {
  if (typeof value !== 'string') return null
  const role = value.trim().toLowerCase()
  return ADMIN_ACCESS_ROLES.includes(role as AdminAccessRole)
    ? (role as AdminAccessRole)
    : null
}

function readMetadataRole(value: unknown): AdminAccessRole | null {
  if (!isRecord(value)) return null
  return normalizeRole(value.role)
}

function readClaimRole(claims: unknown): AdminAccessRole | null {
  if (!isRecord(claims)) return null
  return (
    readMetadataRole(claims.metadata) ||
    readMetadataRole(claims.publicMetadata) ||
    readMetadataRole(claims.public_metadata) ||
    readMetadataRole(claims.app_metadata) ||
    normalizeRole(claims.role)
  )
}

function readClaimEmail(claims: unknown): string | null {
  if (!isRecord(claims)) return null
  const value = claims.email || claims.email_address
  return typeof value === 'string' && value.includes('@') ? value : null
}

type WhitelistLookup =
  | { kind: 'role'; role: AdminAccessRole }
  // Row exists but is_active=false. Treat as an explicit denial so a
  // disabled admin whose Clerk publicMetadata.role is still cached as
  // 'admin' (e.g. because a prior syncClerkRoleByEmail failed) doesn't
  // sneak past the whitelist via the metadata fallback below.
  | { kind: 'denied' }
  // No row, or whitelist unreachable. Caller may fall through to Clerk
  // metadata for users who only got their role via the Clerk dashboard.
  | { kind: 'absent' }

async function readWhitelistRole(email: string): Promise<WhitelistLookup> {
  if (!hasSupabaseAdminConfig()) {
    console.warn('[admin-auth] admin whitelist unavailable: Supabase admin env is missing')
    return { kind: 'absent' }
  }

  const supabase = createSupabaseAdminClient()
  const normalized = email.trim().toLowerCase()
  const { data, error } = await supabase
    .from('admin_whitelist')
    .select('role, email, is_active')
    .ilike('email', normalized)
    .maybeSingle<{ role: string; email: string; is_active: boolean }>()

  if (error) {
    // PostgrestError fields don't always survive serialization in the dev
    // overlay — extract them explicitly so the log is actually useful.
    const e = error as { message?: string; code?: string; details?: string; hint?: string }
    console.error('[admin-auth] admin_whitelist lookup error', {
      email: normalized,
      message: e?.message,
      code: e?.code,
      details: e?.details,
      hint: e?.hint,
    })
    // Treat lookup failure the same as a missing config (above): return
    // 'absent' so the caller falls through to Clerk metadata rather than
    // crashing the entire admin layout on a transient Supabase blip.
    return { kind: 'absent' }
  }
  if (!data) return { kind: 'absent' }
  if (!data.is_active) return { kind: 'denied' }
  const role = normalizeRole(data.role)
  return role ? { kind: 'role', role } : { kind: 'absent' }
}

async function syncClerkRoleIfStale(
  userId: string,
  user: User | null,
  desired: AdminAccessRole
): Promise<void> {
  const currentRole = readMetadataRole(user?.publicMetadata)
  if (currentRole === desired) return
  try {
    const client = await clerkClient()
    const fresh = user ?? (await client.users.getUser(userId))
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { ...(fresh.publicMetadata ?? {}), role: desired },
    })
  } catch (error) {
    console.warn('[admin-auth] could not sync Clerk publicMetadata.role', error)
  }
}

export async function getAdminAccessRole(): Promise<AdminAccessRole | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const email = (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    readClaimEmail(sessionClaims) ||
    ''
  )
    .trim()
    .toLowerCase()

  // admin_whitelist is the source of truth. Check it first so admins added
  // via SQL/admin UI are recognized even when Clerk publicMetadata still
  // says some non-admin role from a prior contributor-invite acceptance.
  if (email) {
    const lookup = await readWhitelistRole(email)
    if (lookup.kind === 'role') {
      await syncClerkRoleIfStale(userId, user, lookup.role)
      return lookup.role
    }
    if (lookup.kind === 'denied') {
      // Disabled in the whitelist — deny access without falling through
      // to Clerk metadata, which may still be cached from before the
      // disable and would otherwise re-grant the user dashboard access.
      return null
    }
  }

  const claimRole = readClaimRole(sessionClaims)
  if (claimRole) return claimRole

  return (
    readMetadataRole(user?.publicMetadata) ||
    readMetadataRole(user?.privateMetadata) ||
    readMetadataRole(user?.unsafeMetadata)
  )
}

export async function getCallerEmail(): Promise<string | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    readClaimEmail(sessionClaims)
  return email ? email.trim().toLowerCase() : null
}

export async function requireAdminRole(
  roles: readonly AdminAccessRole[]
): Promise<AdminAccessRole> {
  const role = await getAdminAccessRole()
  if (!role || !roles.includes(role)) {
    const { userId } = await auth()
    const user = userId ? await currentUser() : null
    const email =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      null
    const detail = `userId=${userId ?? '(none)'} email=${email ?? '(none)'} resolvedRole=${role ?? '(none)'} allowedRoles=[${roles.join(',')}]`
    console.error('[admin-auth] requireAdminRole denied:', detail)
    // Fire-and-forget audit write. We don't await — denial-throwing
    // must stay synchronous for the action's error UX, and the audit
    // helper already catches its own errors.
    void recordAuditEvent({
      eventType: 'auth.role_denied',
      severity: 'critical',
      message: `Role denied for ${email ?? 'unknown caller'}`,
      actorEmail: email,
      actorClerkId: userId ?? null,
      metadata: { resolvedRole: role, allowedRoles: roles },
      resolveActor: false,
    })
    throw new Error(
      "You don't have permission for that. Ask an owner to add you to the admin team, or sign in with an admin account."
    )
  }
  return role
}

// ---------------------------------------------------------------------------
// Permission-based gating (RBAC)
// ---------------------------------------------------------------------------
// Built on top of workforce_roles.permission_keys. The caller's permission
// set is derived by:
//   1. Looking up their workforce_employees row by email
//   2. Unioning permission_keys from their primary dashboard_role and from
//      every role attached via workforce_role_members
//   3. Owners (admin_whitelist.role='owner') short-circuit to the full
//      permission catalog — they can always do everything
//
// Use `requirePermission('workforce.write')` in server actions and
// `await getCallerPermissions()` to feed the Sidebar / route layouts.

export type PermissionKey = string

// Keep this list in sync with apps/opus_admin/src/app/(admin)/workforce/_lib/types.ts
// — duplicated here so this file stays free of the workforce module
// import (which would create a cycle when workforce actions import from
// admin-auth).
const ALL_PERMISSION_KEYS: readonly PermissionKey[] = [
  'cms.read',
  'cms.write',
  'cms.publish',
  'vendor.read',
  'vendor.moderate',
  'bookings.read',
  'bookings.write',
  'finance.read',
  'finance.write',
  'workforce.read',
  'workforce.write',
  'workforce.payroll',
  'insights.read',
  'platform.admin',
] as const

export async function getCallerPermissions(): Promise<Set<PermissionKey>> {
  const role = await getAdminAccessRole()
  // Owners always have everything — keeps founders unblocked even before
  // they're attached to a workforce role.
  if (role === 'owner') return new Set(ALL_PERMISSION_KEYS)
  // No dashboard access at all → empty set.
  if (!role) return new Set()

  if (!hasSupabaseAdminConfig()) {
    console.warn('[admin-auth] permission lookup unavailable: Supabase admin env is missing')
    return new Set()
  }
  const email = await getCallerEmail()
  if (!email) return new Set()

  const supabase = createSupabaseAdminClient()
  const { data: employee, error: employeeError } = await supabase
    .from('workforce_employees')
    .select('id')
    .ilike('email', email)
    .maybeSingle<{ id: string }>()
  if (employeeError) {
    console.error('[admin-auth] permission lookup employee error', employeeError)
    return fallbackRolePermissions(role)
  }
  if (!employee) return fallbackRolePermissions(role)

  // Single SQL trip via the permission helper added in
  // 20260514213347_workforce_dashboard_access.sql.
  const { data, error } = await supabase
    .rpc('workforce_permissions_for_employee', { p_employee_id: employee.id })
    .returns<string[]>()
  if (error) {
    console.error('[admin-auth] workforce_permissions_for_employee error', error)
    return fallbackRolePermissions(role)
  }
  return new Set(Array.isArray(data) ? data : [])
}

// Best-effort fallback for the legacy admin_whitelist roles when there's
// no matching workforce employee record yet. Mirrors what the system
// roles in workforce_roles seed would grant — used so existing admins
// keep working during the rollout.
function fallbackRolePermissions(role: AdminAccessRole): Set<PermissionKey> {
  switch (role) {
    case 'owner':
    case 'admin':
      // Same keys as the seeded 'admin' workforce role (everything except
      // platform.admin, which only owners get).
      return new Set([
        'cms.read', 'cms.write', 'cms.publish',
        'vendor.read', 'vendor.moderate',
        'bookings.read', 'bookings.write',
        'finance.read', 'finance.write',
        'workforce.read', 'workforce.write', 'workforce.payroll',
        'insights.read',
      ])
    case 'editor':
      return new Set(['cms.read', 'cms.write', 'cms.publish', 'vendor.read'])
    case 'viewer':
      return new Set([
        'cms.read', 'vendor.read', 'bookings.read', 'finance.read',
        'workforce.read', 'insights.read',
      ])
    case 'author':
      // Authors don't access the dashboard — they live under /contribute.
      return new Set()
    default:
      return new Set()
  }
}

export async function hasPermission(key: PermissionKey): Promise<boolean> {
  const perms = await getCallerPermissions()
  return perms.has(key)
}

export async function requirePermission(key: PermissionKey): Promise<void> {
  const perms = await getCallerPermissions()
  if (perms.has(key)) return
  const role = await getAdminAccessRole()
  const email = await getCallerEmail()
  console.error('[admin-auth] requirePermission denied:', {
    permission: key, email, resolvedRole: role,
    grantedPermissions: Array.from(perms),
  })
  void auditPermissionDenied(
    key,
    email,
    `resolvedRole=${role ?? '(none)'} grantedCount=${perms.size}`,
  )
  throw new Error(
    `You don't have permission to ${key}. Ask an owner to update your role.`
  )
}

// Useful when the gate is "any of these" (e.g. a section visible to
// readers OR writers). Returns true if the caller has at least one.
export async function hasAnyPermission(keys: readonly PermissionKey[]): Promise<boolean> {
  const perms = await getCallerPermissions()
  return keys.some((k) => perms.has(k))
}
