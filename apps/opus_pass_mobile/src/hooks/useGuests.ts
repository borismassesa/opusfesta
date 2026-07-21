import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getGuestsWithInvitations } from '@/lib/api/dashboard';
import {
  createEvent,
  createGuest,
  deleteEvent,
  deleteGuest,
  deleteRsvpQuestion,
  getEvents,
  getRsvpQuestions,
  updateEvent,
  updateGuest,
} from '@/lib/api/guests';
import type { GuestContactDraft, WeddingEventDraft } from '@/types/dashboard';

/** Everything the Guests hub renders derives from these three queries, so
 *  each mutation invalidates the whole `guests` tree rather than one key. */
const GUESTS_ROOT = ['guests'] as const;

export function useGuests() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: [...GUESTS_ROOT, 'list'],
    queryFn: () => getGuestsWithInvitations(client),
  });
}

export function useEvents() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: [...GUESTS_ROOT, 'events'],
    queryFn: () => getEvents(client),
  });
}

export function useRsvpQuestions() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: [...GUESTS_ROOT, 'rsvp-questions'],
    queryFn: () => getRsvpQuestions(client),
  });
}

/** Shared invalidation so a write anywhere refreshes every guests-hub tab
 *  (and the home dashboard, which counts the same rows). */
function useGuestsInvalidator() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: GUESTS_ROOT });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useSaveGuest() {
  const client = useAuthenticatedSupabase();
  const invalidate = useGuestsInvalidator();
  return useMutation({
    mutationFn: ({ id, draft }: { id?: string; draft: GuestContactDraft }) =>
      id ? updateGuest(client, id, draft) : createGuest(client, draft),
    onSuccess: invalidate,
  });
}

export function useDeleteGuest() {
  const client = useAuthenticatedSupabase();
  const invalidate = useGuestsInvalidator();
  return useMutation({
    mutationFn: (id: string) => deleteGuest(client, id),
    onSuccess: invalidate,
  });
}

export function useSaveEvent() {
  const client = useAuthenticatedSupabase();
  const invalidate = useGuestsInvalidator();
  return useMutation({
    mutationFn: ({ id, draft }: { id?: string; draft: WeddingEventDraft }) =>
      id ? updateEvent(client, id, draft) : createEvent(client, draft),
    onSuccess: invalidate,
  });
}

export function useDeleteEvent() {
  const client = useAuthenticatedSupabase();
  const invalidate = useGuestsInvalidator();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(client, id),
    onSuccess: invalidate,
  });
}

/** Flips one event's `allow_rsvp` — the "Turn RSVP page on" switch. */
export function useToggleEventRsvp() {
  const client = useAuthenticatedSupabase();
  const invalidate = useGuestsInvalidator();
  return useMutation({
    mutationFn: ({ id, allowRsvp }: { id: string; allowRsvp: boolean }) =>
      updateEvent(client, id, { allow_rsvp: allowRsvp }),
    onSuccess: invalidate,
  });
}

export function useDeleteRsvpQuestion() {
  const client = useAuthenticatedSupabase();
  const invalidate = useGuestsInvalidator();
  return useMutation({
    mutationFn: (id: string) => deleteRsvpQuestion(client, id),
    onSuccess: invalidate,
  });
}
