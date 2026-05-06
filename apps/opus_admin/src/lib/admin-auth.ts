import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export type AdminAccessRole = 'owner' | 'admin' | 'editor' | 'author' | 'viewer'

const ADMIN_ACCESS_ROLES: AdminAccessRole[] = [
  'owner',
  'admin',
  'editor',
  'author',
  'viewer',
]

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
    readMetadataRole(claims.app_metadata) ||
    normalizeRole(claims.role)
  )
}

function readClaimEmail(claims: unknown): string | null {
  if (!isRecord(claims)) return null
  const value = claims.email || claims.email_address
  return typeof value === 'string' && value.includes('@') ? value : null
}

async function readWhitelistRole(email: string): Promise<AdminAccessRole | null> {
  const supabase = createSupabaseAdminClient()
  const normalized = email.trim().toLowerCase()
  const { data, error } = await supabase
    .from('admin_whitelist')
    .select('role, email, is_active')
    .ilike('email', normalized)
    .maybeSingle<{ role: string; email: string; is_active: boolean }>()

  if (error) throw error
  if (!data) {
    console.error('[admin-auth] no admin_whitelist row for email', normalized)
    return null
  }
  if (!data.is_active) {
    console.error('[admin-auth] admin_whitelist row is inactive', data)
    return null
  }
  return normalizeRole(data.role)
}

export async function getAdminAccessRole(): Promise<AdminAccessRole | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  const claimRole = readClaimRole(sessionClaims)
  if (claimRole) return claimRole

  const user = await currentUser()
  const metadataRole =
    readMetadataRole(user?.publicMetadata) ||
    readMetadataRole(user?.privateMetadata) ||
    readMetadataRole(user?.unsafeMetadata)
  if (metadataRole) return metadataRole

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    readClaimEmail(sessionClaims)
  if (!email) return null

  return readWhitelistRole(email)
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
