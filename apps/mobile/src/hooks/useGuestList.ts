import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { useOpusFestaAuth } from '@/lib/auth';
import { getOrCreateDefaultEvent, getGuestList, addGuest, updateGuestRsvp, deleteGuest } from '@/lib/api/guests';

export function useWeddingEvent() {
  const client = useAuthenticatedSupabase();
  const { user } = useOpusFestaAuth();

  return useQuery({
    queryKey: ['wedding-event'],
    queryFn: () => getOrCreateDefaultEvent(client, user!.id),
    enabled: !!user,
  });
}

export function useGuestList(eventId: string | undefined) {
  const client = useAuthenticatedSupabase();

  return useQuery({
    queryKey: ['guest-list', eventId],
    queryFn: () => getGuestList(client, eventId!),
    enabled: !!eventId,
  });
}

export function useAddGuest(eventId: string | undefined) {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  const { user } = useOpusFestaAuth();

  return useMutation({
    mutationFn: (input: { full_name: string; phone?: string; email?: string; group_tag?: string }) =>
      addGuest(client, user!.id, eventId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-list', eventId] });
    },
  });
}

export function useUpdateGuestRsvp(eventId: string | undefined) {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  const { user } = useOpusFestaAuth();

  return useMutation({
    mutationFn: ({ guestContactId, rsvpStatus }: { guestContactId: string; rsvpStatus: string }) =>
      updateGuestRsvp(client, user!.id, eventId!, guestContactId, rsvpStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-list', eventId] });
    },
  });
}

export function useDeleteGuest(eventId: string | undefined) {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestContactId: string) => deleteGuest(client, guestContactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-list', eventId] });
    },
  });
}
