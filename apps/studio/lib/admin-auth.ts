import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { StudioRole } from './studio-types'

const ROLE_HIERARCHY: StudioRole[] = ['studio_viewer', 'studio_editor', 'studio_admin']
const VALID_ROLES = new Set<StudioRole>(ROLE_HIERARCHY)

function toRole(value: unknown): StudioRole | null {
  if (typeof value === 'string' && VALID_ROLES.has(value as StudioRole)) {
    return value as StudioRole
  }
  return null
}

export async function getCurrentStudioAccess(): Promise<{
  userId: string | null
  role: StudioRole | null
  email: string | null
}> {
  const { userId } = await auth()

  if (!userId) return { userId: null, role: null, email: null }

  const user = await currentUser()
  const role = toRole(user?.publicMetadata?.studio_role)
  const email = user?.primaryEmailAddress?.emailAddress ?? null

  return { userId, role, email }
}

export async function requireStudioRole(
  minimumRole: StudioRole
): Promise<{ userId: string; role: StudioRole }> {
  const { userId, role } = await getCurrentStudioAccess()

  if (!userId) {
    throw NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  if (!role || ROLE_HIERARCHY.indexOf(role) < ROLE_HIERARCHY.indexOf(minimumRole)) {
    throw NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  return { userId, role }
}

export function hasMinimumRole(userRole: StudioRole, minimumRole: StudioRole): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minimumRole)
}
