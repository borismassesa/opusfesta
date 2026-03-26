import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import {
  getMyWeddingWebsite,
  createWeddingWebsite,
  updateWeddingWebsite,
  updateSection,
  getRsvps,
  getGuestbook,
  approveGuestbookEntry,
} from '@/lib/api/wedding-website';
import type { WebsiteTheme } from '@/types/wedding-website';

export function useWeddingWebsite() {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['wedding-website'],
    queryFn: () => getMyWeddingWebsite(client),
  });
}

export function useCreateWebsite() {
  const client = useAuthenticatedSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { slug: string; theme: WebsiteTheme; userId: string; coupleProfileId?: string }) =>
      createWeddingWebsite(client, opts),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wedding-website'] }),
  });
}

export function useUpdateWebsite() {
  const client = useAuthenticatedSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ websiteId, updates }: { websiteId: string; updates: Record<string, any> }) =>
      updateWeddingWebsite(client, websiteId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wedding-website'] }),
  });
}

export function useUpdateSection() {
  const client = useAuthenticatedSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      updates,
    }: {
      sectionId: string;
      updates: { content?: Record<string, any>; is_published?: boolean };
    }) => updateSection(client, sectionId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wedding-website'] }),
  });
}

export function useRsvpList(websiteId?: string) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['wedding-rsvps', websiteId],
    queryFn: () => getRsvps(client, websiteId!),
    enabled: !!websiteId,
  });
}

export function useGuestbook(websiteId?: string) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['wedding-guestbook', websiteId],
    queryFn: () => getGuestbook(client, websiteId!),
    enabled: !!websiteId,
  });
}

export function useApproveGuestbook() {
  const client = useAuthenticatedSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, approved }: { entryId: string; approved: boolean }) =>
      approveGuestbookEntry(client, entryId, approved),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wedding-guestbook'] }),
  });
}
