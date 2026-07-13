import type { SupabaseClient } from '@supabase/supabase-js';
import type { Guest, RsvpStatus } from '@/types/guest';

// Shape of the joined guest_contacts row as returned by the query below. The
// generic (untyped) Supabase client hands back `any` rows, so we describe the
// fields we actually read here instead of leaking `any` into the mapper.
interface GuestInvitationRow {
  id: string;
  event_id: string;
  rsvp_status: RsvpStatus | null;
  party_size: number | null;
  meal_choice: string | null;
  dietary_notes: string | null;
  guest_message: string | null;
  responded_at: string | null;
}

interface GuestContactRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  group_tag: string | null;
  max_party_size: number | null;
  public_token: string | null;
  last_invited_at: string | null;
  invite_count: number | null;
  guest_invitations: GuestInvitationRow[] | null;
}

// Guest list / RSVP reuses OpusPass's data layer (guest_contacts,
// guest_invitations, wedding_events) instead of a mobile-only table — see
// supabase/migrations/20260526000005_opus_pass_couple_dashboard.sql. Mobile
// keeps a single default wedding_events row per couple (OpusPass supports
// many events; the mobile app only needs one to track RSVPs against).

export async function getOrCreateDefaultEvent(client: SupabaseClient, userId: string) {
  const { data: existing, error: fetchError } = await client
    .from('wedding_events')
    .select('id, name, starts_at')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return existing;

  const { data: profile } = await client
    .from('couple_profiles')
    .select('partner1_name, partner2_name, wedding_date')
    .maybeSingle();

  const name = [profile?.partner1_name, profile?.partner2_name].filter(Boolean).join(' & ') || 'Our Wedding';

  const { data: created, error: insertError } = await client
    .from('wedding_events')
    .insert({
      user_id: userId,
      name,
      event_type: 'reception',
      starts_at: profile?.wedding_date ?? null,
    })
    .select('id, name, starts_at')
    .single();

  if (insertError) throw insertError;
  return created;
}

export async function getGuestList(client: SupabaseClient, eventId: string): Promise<Guest[]> {
  const { data, error } = await client
    .from('guest_contacts')
    .select(
      '*, guest_invitations(id, event_id, rsvp_status, party_size, meal_choice, dietary_notes, guest_message, responded_at)',
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as GuestContactRow[]).map((guest) => {
    const invite = (guest.guest_invitations ?? []).find((inv) => inv.event_id === eventId) ?? null;
    return {
      id: guest.id,
      full_name: guest.full_name,
      email: guest.email,
      phone: guest.phone,
      group_tag: guest.group_tag,
      max_party_size: guest.max_party_size,
      public_token: guest.public_token,
      last_invited_at: guest.last_invited_at,
      invite_count: guest.invite_count,
      rsvp_status: invite?.rsvp_status ?? 'pending',
      party_size: invite?.party_size ?? 1,
      meal_choice: invite?.meal_choice ?? null,
      dietary_notes: invite?.dietary_notes ?? null,
      guest_message: invite?.guest_message ?? null,
      responded_at: invite?.responded_at ?? null,
      invitation_id: invite?.id ?? null,
    };
  });
}

// The public RSVP page lives on OpusPass's own subdomain (opuspass.opusfesta.com/rsvp/:token),
// not in this app — mobile has no guest-facing RSVP screen of its own, so sharing just hands
// off to that page via the guest's public_token (apps/opus_pass/src/lib/dashboard/queries.ts).
const RSVP_BASE_URL = 'https://opuspass.opusfesta.com/rsvp';

export function buildRsvpLink(publicToken: string): string {
  return `${RSVP_BASE_URL}/${publicToken}`;
}

export async function recordInvitationSend(
  client: SupabaseClient,
  userId: string,
  guestContactId: string,
  currentInviteCount: number,
) {
  const { error: updateError } = await client
    .from('guest_contacts')
    .update({ last_invited_at: new Date().toISOString(), invite_count: currentInviteCount + 1 })
    .eq('id', guestContactId);

  if (updateError) throw updateError;

  const { error: logError } = await client
    .from('guest_message_log')
    .insert({ user_id: userId, guest_contact_id: guestContactId, channel: 'link' });

  if (logError) throw logError;
}

export async function addGuest(
  client: SupabaseClient,
  userId: string,
  eventId: string,
  input: { full_name: string; phone?: string; email?: string; group_tag?: string },
) {
  const { data: guest, error } = await client
    .from('guest_contacts')
    .insert({
      user_id: userId,
      full_name: input.full_name,
      phone: input.phone || null,
      email: input.email || null,
      group_tag: input.group_tag || null,
    })
    .select()
    .single();

  if (error) throw error;

  const { error: inviteError } = await client.from('guest_invitations').insert({
    user_id: userId,
    guest_contact_id: guest.id,
    event_id: eventId,
    rsvp_status: 'pending',
  });

  if (inviteError) throw inviteError;
  return guest;
}

export async function updateGuestRsvp(
  client: SupabaseClient,
  userId: string,
  eventId: string,
  guestContactId: string,
  rsvpStatus: string,
) {
  const { error } = await client.from('guest_invitations').upsert(
    {
      user_id: userId,
      guest_contact_id: guestContactId,
      event_id: eventId,
      rsvp_status: rsvpStatus,
      responded_at: rsvpStatus === 'pending' ? null : new Date().toISOString(),
    },
    { onConflict: 'guest_contact_id,event_id' },
  );

  if (error) throw error;
}

export async function deleteGuest(client: SupabaseClient, guestContactId: string) {
  const { error } = await client.from('guest_contacts').delete().eq('id', guestContactId);
  if (error) throw error;
}
