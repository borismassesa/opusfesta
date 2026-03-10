import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { StudioRole } from './studio-types';

const ROLE_HIERARCHY: StudioRole[] = ['studio_viewer', 'studio_editor', 'studio_admin'];

export async function requireStudioRole(
  minimumRole: StudioRole
): Promise<{ clerkId: string; role: StudioRole }> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const metadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  const role = metadata?.studio_role as StudioRole | undefined;

  if (!role || ROLE_HIERARCHY.indexOf(role) < ROLE_HIERARCHY.indexOf(minimumRole)) {
    throw NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  return { clerkId: userId, role };
}

export function hasMinimumRole(userRole: StudioRole, minimumRole: StudioRole): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minimumRole);
}
