// ============================================================================
// Portal Auth Helper — Clerk-based auth for portal API routes
// Gets the Clerk user, then finds/creates a studio_client_profiles record
// ============================================================================

import { auth, currentUser } from '@clerk/nextjs/server';
import { getStudioSupabaseAdmin } from './supabase-admin';

export interface PortalClient {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  location: string | null;
  avatar_url: string | null;
  portal_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
}

/**
 * Get the current portal client from Clerk auth.
 * Creates a studio_client_profiles record if one doesn't exist.
 * Also auto-links any bookings matching the client email.
 * Returns null if user is not authenticated.
 */
export async function getPortalClient(): Promise<PortalClient | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim();
  if (!email) return null;

  const db = getStudioSupabaseAdmin();

  // Try to find existing client profile (case-insensitive to handle legacy data)
  const { data: existing } = await db
    .from('studio_client_profiles')
    .select('id, email, name, phone, whatsapp, company, location, avatar_url, portal_enabled, last_login_at, created_at')
    .ilike('email', email)
    .limit(1)
    .single();

  if (existing) {
    // Update last login, normalize email to lowercase, and ensure portal is enabled
    await db
      .from('studio_client_profiles')
      .update({ email, last_login_at: new Date().toISOString(), portal_enabled: true })
      .eq('id', existing.id);

    // Auto-link any bookings that match by email but don't have client_id set
    await db
      .from('studio_bookings')
      .update({ client_id: existing.id })
      .ilike('email', email)
      .is('client_id', null);

    return { ...existing, email } as PortalClient;
  }

  // No profile yet — check if there's a booking with this email (to prefill name)
  const { data: booking } = await db
    .from('studio_bookings')
    .select('name, phone')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Create new client profile
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    booking?.name ||
    email.split('@')[0];

  const { data: newClient, error } = await db
    .from('studio_client_profiles')
    .insert({
      email,
      name,
      phone: booking?.phone || null,
      portal_enabled: true,
      last_login_at: new Date().toISOString(),
    })
    .select('id, email, name, phone, whatsapp, company, location, avatar_url, portal_enabled, last_login_at, created_at')
    .single();

  if (error || !newClient) {
    console.error('[PORTAL_AUTH] Failed to create client profile:', error?.message);
    return null;
  }

  // Auto-link any existing bookings that match by email
  await db
    .from('studio_bookings')
    .update({ client_id: newClient.id })
    .ilike('email', email)
    .is('client_id', null);

  return newClient as PortalClient;
}
