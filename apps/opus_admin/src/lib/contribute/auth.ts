import { auth, currentUser } from '@clerk/nextjs/server'
import { getAdminAccessRole } from '@/lib/admin-auth'

type ContributorIdentity = {
  clerkId: string
  email: string
  name: string | null
  role: string | null
  isAdmin: boolean
}

function readRole(source: unknown): string | null {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null
  const role = (source as Record<string, unknown>).role
  return typeof role === 'string' ? role.trim().toLowerCase() : null
}

function allowedContributorRole(role: string | null): boolean {
  return role === 'contributor' || role === 'author'
}

export async function getContributorIdentity(): Promise<ContributorIdentity | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const email = (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ''
  )
    .trim()
    .toLowerCase()

  if (!email) return null

  const role =
    readRole(sessionClaims) ||
    readRole(user?.publicMetadata) ||
    readRole(user?.privateMetadata) ||
    readRole(user?.unsafeMetadata)

  const roleLooksAdmin = role ? ['owner', 'admin', 'editor', 'viewer'].includes(role) : false
  const adminRole = roleLooksAdmin ? await getAdminAccessRole() : null
  return {
    clerkId: userId,
    email,
    role,
    isAdmin: Boolean(adminRole && ['owner', 'admin', 'editor'].includes(adminRole)),
    name:
      user?.fullName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      null,
  }
}

export async function requireContributorIdentity(): Promise<ContributorIdentity> {
  const identity = await getContributorIdentity()
  if (!identity) throw new Error('Sign in first.')
  if (!identity.isAdmin && !allowedContributorRole(identity.role)) {
    throw new Error('Contributor access required.')
  }
  return identity
}

export function ownsDraft(
  draft: { author_clerk_id: string | null; author_email: string },
  identity: Pick<ContributorIdentity, 'clerkId' | 'email'>
): boolean {
  return (
    draft.author_clerk_id === identity.clerkId ||
    draft.author_email.trim().toLowerCase() === identity.email
  )
}
