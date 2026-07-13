import type { SupabaseClient } from '@supabase/supabase-js';
import type { VendorMemberRole } from './vendorProfile';

// Member/invitation reads go straight through RLS (members can self-read;
// owner/manager see the whole roster and invitations). Invite creation and
// code redemption go through the vendor-team-invite edge function — the code
// is hashed server-side and redemption patches Clerk metadata, neither of
// which a client can do.

export interface VendorTeamMember {
  id: string;
  user_id: string;
  role: VendorMemberRole;
  status: 'invited' | 'active' | 'disabled';
  created_at: string;
  user: { name: string | null; email: string | null } | null;
}

export interface VendorTeamInvitation {
  id: string;
  email: string;
  role: Exclude<VendorMemberRole, 'owner'>;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  invited_at: string;
  expires_at: string;
}

export async function getVendorTeam(client: SupabaseClient, vendorId: string): Promise<VendorTeamMember[]> {
  const { data, error } = await client
    .from('vendor_memberships')
    .select('id, user_id, role, status, created_at, user:users(name, email)')
    .eq('vendor_id', vendorId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as VendorTeamMember[];
}

export async function getVendorInvitations(client: SupabaseClient, vendorId: string): Promise<VendorTeamInvitation[]> {
  const { data, error } = await client
    .from('vendor_membership_invitations')
    .select('id, email, role, status, invited_at, expires_at')
    .eq('vendor_id', vendorId)
    .eq('status', 'pending')
    .order('invited_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as VendorTeamInvitation[];
}

export async function inviteTeamMember(
  client: SupabaseClient,
  vendorId: string,
  email: string,
  role: Exclude<VendorMemberRole, 'owner'>
): Promise<string> {
  const { data, error } = await client.functions.invoke('vendor-team-invite', {
    body: { action: 'invite', vendorId, email, role },
  });
  if (error) throw error;
  return data.code as string;
}

export async function revokeInvitation(client: SupabaseClient, invitationId: string): Promise<void> {
  const { error } = await client
    .from('vendor_membership_invitations')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('status', 'pending');
  if (error) throw error;
}

export async function redeemInviteCode(
  client: SupabaseClient,
  code: string
): Promise<{ vendorId: string; role: VendorMemberRole; businessName: string | null }> {
  const { data, error } = await client.functions.invoke('vendor-team-invite', {
    body: { action: 'redeem', code },
  });
  if (error) throw error;
  return data as { vendorId: string; role: VendorMemberRole; businessName: string | null };
}
