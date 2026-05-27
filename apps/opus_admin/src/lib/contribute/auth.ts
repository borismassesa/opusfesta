import { cache } from 'react'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getAdminAccessRole } from '@/lib/admin-auth'
import { hasContributorGrant } from '@/lib/contribute/invitations'

type ContributorIdentity = {
  clerkId: string
  email: string
  name: string | null
  role: string | null
  isAdmin: boolean
}

export type ContributorAccessStatus =
  | { kind: 'signed_out' }
  | { kind: 'no_access'; identity: ContributorIdentity }
  | { kind: 'granted'; identity: ContributorIdentity }

function readRole(source: unknown): string | null {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null
  const role = (source as Record<string, unknown>).role
  return typeof role === 'string' ? role.trim().toLowerCase() : null
}

function allowedContributorRole(role: string | null): boolean {
  return role === 'contributor' || role === 'author'
}

export const getContributorIdentity = cache(
  async (): Promise<ContributorIdentity | null> => {
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

    // Always consult admin_whitelist (DB source of truth) so an admin whose
    // Clerk role is still 'contributor' from a prior invite acceptance is
    // recognized as an admin here too.
    const adminRole = await getAdminAccessRole()
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
  },
)

export const resolveContributorAccess = cache(
  async (): Promise<ContributorAccessStatus> => {
    const identity = await getContributorIdentity()
    if (!identity) return { kind: 'signed_out' }
    const granted =
      identity.isAdmin ||
      allowedContributorRole(identity.role) ||
      (await hasContributorGrant(identity))
    return granted ? { kind: 'granted', identity } : { kind: 'no_access', identity }
  },
)

export async function requireContributorIdentity(): Promise<ContributorIdentity> {
  const status = await resolveContributorAccess()
  if (status.kind === 'signed_out') throw new Error('Sign in first.')
  if (status.kind === 'no_access') throw new Error('Contributor access required.')
  return status.identity
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
