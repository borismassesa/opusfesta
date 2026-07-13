import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { useCoupleProfile } from '@/hooks/useCoupleProfile';
import {
  approveGuestbookEntry,
  buildDefaultSiteDoc,
  getGuestbook,
  publishWebsite,
  saveWebsiteMeta,
  unpublishWebsite,
} from '@/lib/api/wedding-website';
import type { BuilderMeta, SiteDoc, WebsitePresetId } from '@/types/site-doc';
import type { CoupleProfile } from '@/types/couple';

/** Reuses useCoupleProfile()'s ['couple-profile'] cache entry — the site
 *  doc lives on the same row, so there's no separate query key to keep in
 *  sync. */
export function useWeddingWebsite() {
  const query = useCoupleProfile();
  const profile = query.data as CoupleProfile | null | undefined;

  return {
    ...query,
    data: profile
      ? {
          doc: (profile.website_doc ?? null) as SiteDoc | null,
          publicSlug: (profile.public_slug ?? null) as string | null,
          publishedAt: (profile.website_published_at ?? null) as string | null,
          sharingEnabled: !!profile.public_sharing_enabled,
          partner1Name: (profile.partner1_name ?? null) as string | null,
          partner2Name: (profile.partner2_name ?? null) as string | null,
        }
      : undefined,
  };
}

export function useCreateWebsite() {
  const client = useAuthenticatedSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerA,
      partnerB,
      presetId,
      welcome,
    }: {
      partnerA: string;
      partnerB: string;
      presetId: WebsitePresetId;
      welcome?: string;
    }) => saveWebsiteMeta(client, buildDefaultSiteDoc(partnerA, partnerB, presetId, welcome), {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['couple-profile'] }),
  });
}

export function useSaveWebsiteMeta() {
  const client = useAuthenticatedSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ doc, metaPatch }: { doc: SiteDoc; metaPatch: Partial<BuilderMeta> }) =>
      saveWebsiteMeta(client, doc, metaPatch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['couple-profile'] }),
  });
}

export function usePublishWebsite() {
  const client = useAuthenticatedSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (doc: SiteDoc) => publishWebsite(client, doc),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['couple-profile'] }),
  });
}

export function useUnpublishWebsite() {
  const client = useAuthenticatedSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unpublishWebsite(client),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['couple-profile'] }),
  });
}

// ── Guestbook (mock/hardcoded — see src/lib/api/wedding-website.ts) ──

export function useGuestbook() {
  return useQuery({ queryKey: ['wedding-guestbook'], queryFn: getGuestbook });
}

export function useApproveGuestbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, approved }: { entryId: string; approved: boolean }) =>
      approveGuestbookEntry(entryId, approved),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wedding-guestbook'] }),
  });
}
