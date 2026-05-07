import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import type { User } from '@clerk/nextjs/server'
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from '@/lib/supabase'

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
    console.error('[admin-auth] admin_whitelist lookup error', { email: normalized, error })
    throw error
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
      '(none)'
    const detail = `userId=${userId ?? '(none)'} email=${email} resolvedRole=${role ?? '(none)'} allowedRoles=[${roles.join(',')}]`
    console.error('[admin-auth] requireAdminRole denied:', detail)
    throw new Error(
      "You don't have permission for that. Ask an owner to add you to the admin team, or sign in with an admin account."
    )
  }
  return role
}
