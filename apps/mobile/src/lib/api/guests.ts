import type { SupabaseClient } from '@supabase/supabase-js';

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

export async function getGuestList(client: SupabaseClient, eventId: string) {
  const { data, error } = await client
    .from('guest_contacts')
    .select('*, guest_invitations(id, event_id, rsvp_status, party_size)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((guest: any) => {
    const invite = (guest.guest_invitations ?? []).find((inv: any) => inv.event_id === eventId) ?? null;
    return {
      id: guest.id,
      full_name: guest.full_name,
      email: guest.email,
      phone: guest.phone,
      group_tag: guest.group_tag,
      max_party_size: guest.max_party_size,
      rsvp_status: invite?.rsvp_status ?? 'pending',
      party_size: invite?.party_size ?? 1,
      invitation_id: invite?.id ?? null,
    };
  });
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
