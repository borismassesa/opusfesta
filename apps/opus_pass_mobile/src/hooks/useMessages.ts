import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import {
  getConversations,
  getMessages,
  getThread,
  markThreadRead,
  sendMessage,
} from '@/lib/api/messages';
import { MissingInternalUserError, useInternalUserId } from './useInternalUserId';

export function useConversations() {
  const client = useAuthenticatedSupabase();
  const { data: userId } = useInternalUserId();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(client, userId ?? null),
  });
}

export function useThread(threadId: string | undefined) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => getThread(client, threadId!),
    enabled: Boolean(threadId),
  });
}

export function useMessages(threadId: string | undefined) {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => getMessages(client, threadId!),
    enabled: Boolean(threadId),
  });

  // Realtime: new rows land without a refetch loop.
  useEffect(() => {
    if (!threadId) return;

    const channel = client
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', threadId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [client, threadId, queryClient]);

  return query;
}

export function useSendMessage(threadId: string | undefined) {
  const client = useAuthenticatedSupabase();
  const { data: userId } = useInternalUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!threadId) throw new Error('No conversation selected.');
      if (!userId) throw new MissingInternalUserError();
      return sendMessage(client, threadId, userId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', threadId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkThreadRead(threadId: string | undefined) {
  const client = useAuthenticatedSupabase();
  const { data: userId } = useInternalUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!threadId || !userId) return;
      return markThreadRead(client, threadId, userId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
