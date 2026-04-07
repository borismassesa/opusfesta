// ============================================================================
// Portal Auth Helper — magic link session auth for portal API routes
// Reads the of_client_session cookie, validates it, returns the client profile
// ============================================================================

import { getClientFromCookies } from './client-auth';
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
 * Get the current portal client from the magic link session cookie.
 * Fetches the full profile (including location + avatar_url) from Supabase.
 * Also auto-links any unlinked bookings matching the client email.
 * Returns null if the session is missing or expired.
 */
export async function getPortalClient(): Promise<PortalClient | null> {
  const session = await getClientFromCookies();
  if (!session) return null;

  const db = getStudioSupabaseAdmin();

  const { data: profile } = await db
    .from('studio_client_profiles')
    .select('id, email, name, phone, whatsapp, company, location, avatar_url, portal_enabled, last_login_at, created_at')
    .eq('id', session.client.id)
    .single();

  if (!profile) return null;

  // Auto-link bookings that match by email and have no client_id yet
  await db
    .from('studio_bookings')
    .update({ client_id: profile.id })
    .ilike('email', profile.email)
    .is('client_id', null);

  return profile as PortalClient;
}
