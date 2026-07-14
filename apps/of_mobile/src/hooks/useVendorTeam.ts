import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import {
  getVendorTeam,
  getVendorInvitations,
  inviteTeamMember,
  revokeInvitation,
  redeemInviteCode,
} from '@/lib/api/vendorTeam';
import type { VendorMemberRole } from '@/lib/api/vendorProfile';

export function useVendorTeam(vendorId: string | undefined) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['vendor-team', vendorId],
    queryFn: () => getVendorTeam(client, vendorId!),
    enabled: !!vendorId,
  });
}

export function useVendorInvitations(vendorId: string | undefined, enabled: boolean) {
  const client = useAuthenticatedSupabase();
  return useQuery({
    queryKey: ['vendor-invitations', vendorId],
    queryFn: () => getVendorInvitations(client, vendorId!),
    enabled: !!vendorId && enabled,
  });
}

export function useInviteTeamMember() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, email, role }: { vendorId: string; email: string; role: Exclude<VendorMemberRole, 'owner'> }) =>
      inviteTeamMember(client, vendorId, email, role),
    onSuccess: (_code, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invitations', vendorId] });
    },
  });
}

export function useRevokeInvitation() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invitationId }: { invitationId: string; vendorId: string }) => revokeInvitation(client, invitationId),
    onSuccess: (_data, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invitations', vendorId] });
    },
  });
}

export function useRedeemInviteCode() {
  const client = useAuthenticatedSupabase();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code }: { code: string }) => redeemInviteCode(client, code),
    onSuccess: () => {
      // The caller just became a vendor member — their identity resolution
      // and everything hanging off it changes.
      queryClient.invalidateQueries({ queryKey: ['vendor', 'me'] });
    },
  });
}
