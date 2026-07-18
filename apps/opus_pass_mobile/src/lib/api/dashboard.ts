import type { SupabaseClient } from '@supabase/supabase-js';
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
    client.from('guest_contacts').select('id, full_name').order('created_at', { ascending: false }),
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
    .select('partner1_name, partner2_name, wedding_date')
    .maybeSingle<CoupleProfileLite>();
  if (error) throw error;
  return data ?? null;
}

export async function getUpcomingEvents(client: SupabaseClient, limit = 3): Promise<WeddingEvent[]> {
  const { data, error } = await client
    .from('wedding_events')
    .select('id, name, event_type, venue_name, address, city, starts_at, ends_at, sort_order')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as WeddingEvent[];
}
