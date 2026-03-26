import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getConversations, getMessages, sendMessage } from '@/lib/api/messages';

export function useConversations() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(client),
  });
}

export function useMessages(threadId: string | undefined) {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => getMessages(client, threadId!),
    enabled: !!threadId,
  });

  // Subscribe to realtime message updates
  useEffect(() => {
    if (!threadId) return;

    const channel = client
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', threadId] });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [threadId, client, queryClient]);

  return query;
}

export function useSendMessage() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      sendMessage(client, threadId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.threadId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
