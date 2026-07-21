import type { SupabaseClient } from '@supabase/supabase-js';
import { WEDDING_EVENT_COLUMNS } from '@/lib/api/dashboard';
import type {
  GuestContactDraft,
  RsvpQuestion,
  WeddingEvent,
  WeddingEventDraft,
} from '@/types/dashboard';

/**
 * Every table here denormalizes ownership onto `user_id` and gates it with
 * `requesting_user_id() = user_id` RLS, so reads need no explicit filter and
 * writes need no explicit user_id — it defaults from the caller's own Clerk
 * JWT (see supabase/migrations/20260721000004_opuspass_guest_tables_user_id_default.sql).
 */

// ----------------------------------------------------------------- Guests

export async function createGuest(client: SupabaseClient, draft: GuestContactDraft): Promise<void> {
  const { error } = await client.from('guest_contacts').insert(draft);
  if (error) throw error;
}

export async function updateGuest(
  client: SupabaseClient,
  id: string,
  draft: GuestContactDraft,
): Promise<void> {
  const { error } = await client.from('guest_contacts').update(draft).eq('id', id);
  if (error) throw error;
}

export async function deleteGuest(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('guest_contacts').delete().eq('id', id);
  if (error) throw error;
}

// ----------------------------------------------------------------- Events

export async function getEvents(client: SupabaseClient): Promise<WeddingEvent[]> {
  const { data, error } = await client
    .from('wedding_events')
    .select(WEDDING_EVENT_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as WeddingEvent[];
}

export async function createEvent(client: SupabaseClient, draft: WeddingEventDraft): Promise<void> {
  const { error } = await client.from('wedding_events').insert(draft);
  if (error) throw error;
}

export async function updateEvent(
  client: SupabaseClient,
  id: string,
  draft: Partial<WeddingEventDraft>,
): Promise<void> {
  const { error } = await client.from('wedding_events').update(draft).eq('id', id);
  if (error) throw error;
}

export async function deleteEvent(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('wedding_events').delete().eq('id', id);
  if (error) throw error;
}

// ------------------------------------------------------------ RSVP questions

export async function getRsvpQuestions(client: SupabaseClient): Promise<RsvpQuestion[]> {
  const { data, error } = await client
    .from('rsvp_questions')
    .select('id, event_id, prompt, description, kind, required, attending_only, options, sort_order')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as RsvpQuestion[];
}

export async function deleteRsvpQuestion(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('rsvp_questions').delete().eq('id', id);
  if (error) throw error;
}
