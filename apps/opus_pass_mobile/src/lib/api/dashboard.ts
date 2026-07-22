import type { SupabaseClient } from '@supabase/supabase-js';
import { coupleSlugBase } from '@/lib/share';
import type {
  CoupleProfileLite,
  DashboardStats,
  GuestInvitation,
  GuestWithInvitations,
  WeddingEvent,
} from '@/types/dashboard';

/**
 * RLS (`guest_contacts_owner` / `guest_invitations_owner`, see
 * supabase/migrations/20260526000005_opus_pass_couple_dashboard.sql) scopes
 * every row to `requesting_user_id()`, resolved from the Clerk JWT the
 * authenticated client injects — so unlike the web dashboard (which uses a
 * service-role client and filters explicitly), these queries need no
 * `.eq('user_id', ...)`.
 */
export async function getGuestsWithInvitations(client: SupabaseClient): Promise<GuestWithInvitations[]> {
  const [{ data: guests, error: gErr }, { data: invitations, error: iErr }] = await Promise.all([
    client
      .from('guest_contacts')
      .select('id, full_name, email, phone, whatsapp_phone, group_tag, max_party_size, notes')
      .order('created_at', { ascending: false }),
    client
      .from('guest_invitations')
      .select('id, guest_contact_id, event_id, rsvp_status, party_size, meal_choice, responded_at'),
  ]);
  if (gErr) throw gErr;
  if (iErr) throw iErr;

  const byGuest = new Map<string, GuestInvitation[]>();
  for (const inv of (invitations ?? []) as GuestInvitation[]) {
    const list = byGuest.get(inv.guest_contact_id) ?? [];
    list.push(inv);
    byGuest.set(inv.guest_contact_id, list);
  }

  return ((guests ?? []) as GuestWithInvitations[]).map((g) => ({
    ...g,
    invitations: byGuest.get(g.id) ?? [],
  }));
}

/** Mirrors apps/opus_pass/src/lib/dashboard/queries.ts `getStats()` — pure
 *  computation over guests+invitations, no separate query. */
export function computeStats(guests: GuestWithInvitations[]): DashboardStats {
  let attending = 0;
  let declined = 0;
  let maybe = 0;
  let pending = 0;
  let expectedHeadcount = 0;
  let invitedGuests = 0;
  let respondedInvites = 0;
  let totalInvites = 0;
  const meals = new Map<string, number>();

  for (const guest of guests) {
    if (guest.invitations.length > 0) invitedGuests += 1;
    for (const inv of guest.invitations) {
      totalInvites += 1;
      switch (inv.rsvp_status) {
        case 'attending':
          attending += 1;
          respondedInvites += 1;
          expectedHeadcount += inv.party_size;
          if (inv.meal_choice) meals.set(inv.meal_choice, (meals.get(inv.meal_choice) ?? 0) + inv.party_size);
          break;
        case 'declined':
          declined += 1;
          respondedInvites += 1;
          break;
        case 'maybe':
          maybe += 1;
          respondedInvites += 1;
          break;
        default:
          pending += 1;
      }
    }
  }

  return {
    totalGuests: guests.length,
    invitedGuests,
    attending,
    declined,
    maybe,
    pending,
    expectedHeadcount,
    responseRate: totalInvites === 0 ? 0 : Math.round((respondedInvites / totalInvites) * 100),
    mealBreakdown: [...meals.entries()]
      .map(([choice, count]) => ({ choice, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getDashboardStats(client: SupabaseClient): Promise<DashboardStats> {
  const guests = await getGuestsWithInvitations(client);
  return computeStats(guests);
}

export async function getCoupleProfile(client: SupabaseClient): Promise<CoupleProfileLite | null> {
  const { data, error } = await client
    .from('couple_profiles')
    .select(
      'partner1_name, partner2_name, wedding_date, public_slug, cover_image_url, public_sharing_enabled, city',
    )
    .maybeSingle<CoupleProfileLite>();
  if (error) throw error;
  return data ?? null;
}

/**
 * Set (or clear) the couple's wedding date — the anchor every checklist due
 * date is derived from. Update-only: creating a couple_profiles row needs a
 * user_id this client can't resolve, so a couple with no profile yet gets a
 * clear error rather than a silent no-op.
 */
export async function setWeddingDate(
  client: SupabaseClient,
  weddingDate: string | null,
): Promise<void> {
  const { data, error } = await client
    .from('couple_profiles')
    .update({ wedding_date: weddingDate })
    .not('id', 'is', null)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No couple profile found for this account yet.');
  }
}

/**
 * Turn on the couple's public, forwardable invite link (apps/opus_pass's
 * `/i/<slug>` hub) — mirrors apps/opus_pass/src/lib/dashboard/actions.ts's
 * `enablePublicSharing()`, but as a direct RLS-scoped write (mobile has no
 * server-action layer) since `couple_profiles_update_own` already lets the
 * Clerk-JWT-authenticated owner update their own row. Idempotent: reuses an
 * existing slug if one was already reserved (e.g. from the web dashboard).
 */
export async function enablePublicSharing(client: SupabaseClient): Promise<{ slug: string }> {
  const { data: profile, error: readError } = await client
    .from('couple_profiles')
    .select('id, partner1_name, partner2_name, public_slug')
    .maybeSingle<{ id: string; partner1_name: string | null; partner2_name: string | null; public_slug: string | null }>();
  if (readError) throw readError;
  if (!profile) throw new Error('No couple profile found for this account.');

  let slug = profile.public_slug;
  if (!slug) {
    slug = await reserveUniqueSlug(client, coupleSlugBase(profile.partner1_name, profile.partner2_name));
  }

  const { error: writeError } = await client
    .from('couple_profiles')
    .update({ public_slug: slug, public_sharing_enabled: true })
    .eq('id', profile.id);
  if (writeError) throw writeError;

  return { slug };
}

/** Find an unused public_slug, appending -2, -3… on collision. */
async function reserveUniqueSlug(client: SupabaseClient, base: string): Promise<string> {
  let candidate = base;
  for (let attempt = 2; attempt <= 20; attempt++) {
    const { data, error } = await client
      .from('couple_profiles')
      .select('id')
      .eq('public_slug', candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${Date.now()}`;
}

export const WEDDING_EVENT_COLUMNS =
  'id, name, event_type, venue_name, address, city, starts_at, ends_at, sort_order, allow_rsvp';

export async function getUpcomingEvents(client: SupabaseClient, limit = 3): Promise<WeddingEvent[]> {
  const { data, error } = await client
    .from('wedding_events')
    .select(WEDDING_EVENT_COLUMNS)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as WeddingEvent[];
}
