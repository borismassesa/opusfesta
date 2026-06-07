import { cache } from 'react'
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

// Roles that can ONLY be granted via `admin_whitelist`. The Clerk
// claims/metadata fallback is intentionally non-authoritative for these
// — letting an `owner` or `admin` role come through publicMetadata would
// silently re-grant elevated access to a user whose whitelist row was
// removed (the row was the source of truth; the metadata copy can be
// stale or set manually in Clerk's dashboard).
//
// 2026-05-17 audit: `bmmassesa@gmail.com` had `publicMetadata.role='owner'`
// despite no whitelist row, so they had owner access via the fallback path.
// This filter closes that hole — they now fall back to no role (deny).
const ELEVATED_ROLES: readonly AdminAccessRole[] = ['owner', 'admin']

function isElevatedRole(role: AdminAccessRole): boolean {
  return ELEVATED_ROLES.includes(role)
}

// TEMPORARY: when DISABLE_ADMIN_AUTH=true every caller is treated as an
// `owner` so the dashboard is reachable without signing in. This is a
// development convenience only — the Clerk + admin_whitelist machinery below
// is left untouched. Remove the flag (or set it to anything but 'true') to
// restore real auth. Mirrored in proxy.ts, which skips route protection under
// the same flag.
function isAdminAuthDisabled(): boolean {
  return process.env.DISABLE_ADMIN_AUTH === 'true'
}

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

// True when the signed-in user was provisioned with a temporary password
// (admin "create login now" path) and hasn't set their own yet. The admin
// layout uses this to bounce them to /set-password before they can use the
// dashboard. Read LIVE from Clerk (not session claims) so a user who just
// reset isn't trapped by a stale token. Returns false for everyone who was
// never given a temp password, so it's a no-op for existing admins.
export const callerMustResetPassword = cache(async (): Promise<boolean> => {
  if (isAdminAuthDisabled()) return false
  const { userId } = await auth()
  if (!userId) return false
  const user = await currentUser()
  return user?.publicMetadata?.mustResetPassword === true
})

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

// Both wrapped in React.cache so a single request resolves Clerk +
// admin_whitelist exactly once even when invoked from layout, page,
// and downstream server actions. Clerk's currentUser() is the
// expensive call here.
export const getAdminAccessRole = cache(
  async (): Promise<AdminAccessRole | null> => {
    if (isAdminAuthDisabled()) return 'owner'
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

    // Fallback path: Clerk session claims / publicMetadata. These exist
    // primarily for the /contribute invite flow which sets editor/author
    // metadata in Clerk without writing to admin_whitelist. We do NOT
    // accept elevated roles (owner/admin) from this path — see comment on
    // ELEVATED_ROLES for the why.
    const claimRole = readClaimRole(sessionClaims)
    if (claimRole) {
      if (!isElevatedRole(claimRole)) return claimRole
      logRejectedElevatedFallback('session_claims', claimRole, email, userId)
    }

    const metadataRole =
      readMetadataRole(user?.publicMetadata) ||
      readMetadataRole(user?.privateMetadata) ||
      readMetadataRole(user?.unsafeMetadata)
    if (metadataRole) {
      if (!isElevatedRole(metadataRole)) return metadataRole
      logRejectedElevatedFallback('clerk_metadata', metadataRole, email, userId)
    }

    return null
  },
)

function logRejectedElevatedFallback(
  source: 'session_claims' | 'clerk_metadata',
  role: AdminAccessRole,
  email: string,
  clerkUserId: string,
): void {
  console.warn(
    `[admin-auth] rejecting elevated role from ${source} fallback — not in admin_whitelist`,
    { email, clerkUserId, role },
  )
  // Fire-and-forget audit write. Surfaces as a critical event in
  // /insights/audit so an unexpected elevated-role-in-metadata is visible
  // even though access was correctly denied.
  void recordAuditEvent({
    eventType: 'auth.elevated_role_rejected',
    severity: 'critical',
    message: `Rejected elevated role '${role}' from ${source} for ${email || 'unknown caller'} (no admin_whitelist row)`,
    actorEmail: email || null,
    actorClerkId: clerkUserId,
    metadata: { source, role },
    resolveActor: false,
  })
}

// Escape Postgres LIKE/ILIKE metacharacters so a value used as an equality
// match can't be interpreted as a pattern. Without this, an email such as
// `john_doe@x.com` would match any single character at the `_`, silently
// resolving to a different employee row.
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`)
}

export const getCallerEmail = cache(async (): Promise<string | null> => {
  if (isAdminAuthDisabled()) return 'dev@opusfesta.com'
  const { userId, sessionClaims } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    readClaimEmail(sessionClaims)
  return email ? email.trim().toLowerCase() : null
})

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

// Wrapped in React.cache so that the layout's permission lookup and
// page.tsx's permission lookup on the same request resolve via one
// chain of Clerk + Supabase calls. Without this, the dashboard fires
// 4–6 sequential round-trips twice per render.
export const getCallerPermissions = cache(
  async (): Promise<Set<PermissionKey>> => {
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
  },
)

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
