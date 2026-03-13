import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { StudioRole } from './studio-types';
import { getStudioSupabaseAdmin } from './supabase-admin';

const ROLE_HIERARCHY: StudioRole[] = ['studio_viewer', 'studio_editor', 'studio_admin'];
const STUDIO_ROLES = new Set<StudioRole>(ROLE_HIERARCHY);

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function toStudioRole(value: unknown): StudioRole | null {
  if (typeof value !== 'string') return null;
  return STUDIO_ROLES.has(value as StudioRole) ? (value as StudioRole) : null;
}

function getStudioRoleFromSessionClaims(sessionClaims: unknown): StudioRole | null {
  const claims = toRecord(sessionClaims);
  if (!claims) return null;

  return (
    toStudioRole(claims.studio_role) ||
    toStudioRole(toRecord(claims.publicMetadata)?.studio_role) ||
    toStudioRole(toRecord(claims.public_metadata)?.studio_role) ||
    toStudioRole(toRecord(claims.metadata)?.studio_role) ||
    null
  );
}

function mapPlatformRoleToStudioRole(role: unknown): StudioRole | null {
  if (typeof role !== 'string') return null;
  const normalizedRole = role.toLowerCase();

  if (normalizedRole === 'admin' || normalizedRole === 'owner') return 'studio_admin';
  if (normalizedRole === 'editor') return 'studio_editor';
  if (normalizedRole === 'viewer') return 'studio_viewer';

  return null;
}

async function getStudioRoleFromSupabase(
  clerkId: string,
  email: string | null
): Promise<StudioRole | null> {
  try {
    const supabase = getStudioSupabaseAdmin();

    const byClerkId = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', clerkId)
      .maybeSingle();

    if (byClerkId.data?.role) {
      return mapPlatformRoleToStudioRole(byClerkId.data.role);
    }

    if (!email) return null;

    const byEmail = await supabase
      .from('users')
      .select('role')
      .ilike('email', email)
      .maybeSingle();

    if (byEmail.data?.role) {
      return mapPlatformRoleToStudioRole(byEmail.data.role);
    }
  } catch (error) {
    // Keep auth resilient even if DB/env is unavailable.
    console.error('[studio-admin] Failed Supabase role fallback:', error);
  }

  return null;
}

export async function getCurrentStudioAccess(): Promise<{ clerkId: string | null; role: StudioRole | null }> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { clerkId: null, role: null };
  }

  const roleFromClaims = getStudioRoleFromSessionClaims(sessionClaims);
  if (roleFromClaims) {
    return { clerkId: userId, role: roleFromClaims };
  }

  const user = await currentUser();
  const roleFromUser = toStudioRole(user?.publicMetadata?.studio_role);
  if (roleFromUser) {
    return { clerkId: userId, role: roleFromUser };
  }

  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.find((emailAddress) => emailAddress.id === user?.primaryEmailAddressId)?.emailAddress ??
    null;

  const roleFromSupabase = await getStudioRoleFromSupabase(userId, primaryEmail);

  return { clerkId: userId, role: roleFromSupabase };
}

export async function requireStudioRole(
  minimumRole: StudioRole
): Promise<{ clerkId: string; role: StudioRole }> {
  const { clerkId, role } = await getCurrentStudioAccess();

  if (!clerkId) {
    throw NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  if (!role || ROLE_HIERARCHY.indexOf(role) < ROLE_HIERARCHY.indexOf(minimumRole)) {
    throw NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  return { clerkId, role };
}

export function hasMinimumRole(userRole: StudioRole, minimumRole: StudioRole): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minimumRole);
}
