import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, TextInput, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { useVendorTeam, useVendorInvitations, useInviteTeamMember, useRevokeInvitation } from '@/hooks/useVendorTeam';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { getErrorMessage } from '@/lib/errors';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
};

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface mb-2">
      {children}
    </Text>
  );
}

const CARD_CLASS = 'bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-4 mb-5';

function InviteForm({ vendorId, businessName, ownerCanInviteManager }: { vendorId: string; businessName: string; ownerCanInviteManager: boolean }) {
  const { editorial } = useTheme();
  const inviteMutation = useInviteTeamMember();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'manager' | 'staff'>('staff');
  const [issuedCode, setIssuedCode] = useState<string | null>(null);

  const submit = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      Alert.alert('Invalid email', 'Enter the team member’s email address.');
      return;
    }
    inviteMutation.mutate(
      { vendorId, email: trimmed, role },
      {
        onSuccess: (code) => {
          setIssuedCode(code);
          setEmail('');
        },
        onError: (err) => Alert.alert('Could not create invite', getErrorMessage(err, 'Please try again.')),
      }
    );
  };

  if (issuedCode) {
    return (
      <View className={CARD_CLASS} style={shadowSoftSm}>
        <Text className="font-work-sans-bold text-[10px] tracking-[1px] uppercase text-ed-on-surface-variant">
          Invite code — shown once
        </Text>
        <Text className="font-space-grotesk-bold text-[30px] tracking-[4px] text-ed-on-surface my-2.5">
          {issuedCode}
        </Text>
        <Text className="font-work-sans text-xs text-ed-on-surface-variant mb-3">
          Share it with your team member. They sign up in the OpusFesta app, choose “Join a vendor team”, and enter this code. It expires in 7 days.
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() =>
              Share.share({
                message: `You've been invited to join ${businessName} on OpusFesta. Download the app, sign up, choose "Join a vendor team", and enter this code: ${issuedCode}`,
              })
            }
            className="flex-1 rounded-xl py-3 items-center bg-ed-primary-container"
          >
            <Text className="font-work-sans-bold text-[13px] text-white">Share code</Text>
          </Pressable>
          <Pressable
            onPress={() => setIssuedCode(null)}
            className="flex-1 rounded-xl py-3 items-center border border-ed-outline-variant"
          >
            <Text className="font-work-sans-bold text-[13px] text-ed-on-surface-variant">Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className={CARD_CLASS} style={shadowSoftSm}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="teammate@business.com"
        placeholderTextColor={editorial.onSurfaceVariant}
        keyboardType="email-address"
        autoCapitalize="none"
        className="bg-ed-surface-container-low rounded-xl border border-ed-outline-variant p-3 font-work-sans text-sm text-ed-on-surface mb-3"
      />
      <View className="flex-row gap-2 mb-3">
        {(['staff', ...(ownerCanInviteManager ? (['manager'] as const) : [])] as ('staff' | 'manager')[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            className={`px-3.5 py-2 rounded-full border ${
              role === r ? 'bg-ed-on-surface border-ed-on-surface' : 'bg-ed-surface-container-low border-ed-outline-variant'
            }`}
          >
            <Text className={`font-work-sans-bold text-xs ${role === r ? 'text-white' : 'text-ed-on-surface-variant'}`}>
              {ROLE_LABELS[r]}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text className="font-work-sans text-[11px] text-ed-on-surface-variant mb-3">
        {role === 'manager'
          ? 'Managers can edit the storefront, manage bookings and the calendar, and invite staff.'
          : 'Staff can view leads, bookings, and the calendar, and message couples.'}
      </Text>
      <Pressable
        disabled={inviteMutation.isPending}
        onPress={submit}
        className={`rounded-xl py-3 items-center bg-ed-primary-container ${inviteMutation.isPending ? 'opacity-50' : 'opacity-100'}`}
      >
        <Text className="font-work-sans-bold text-[13px] text-white">
          {inviteMutation.isPending ? 'Creating…' : 'Create invite code'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function TeamScreen() {
  const { editorial } = useTheme();
  const { vendor, myRole, isLoading: vendorLoading } = useCurrentVendor();
  const canManage = myRole === 'owner' || myRole === 'manager';
  const { data: members, isLoading: membersLoading } = useVendorTeam(vendor?.id);
  const { data: invitations } = useVendorInvitations(vendor?.id, canManage);
  const revokeMutation = useRevokeInvitation();

  if (vendorLoading || !vendor) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="small" color={editorial.primaryContainer} className="mt-[60px]" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text className="font-dancing-script-bold text-[28px] text-ed-primary-container mb-5">
        Team
      </Text>

      <SectionTitle>Members</SectionTitle>
      <View className={CARD_CLASS} style={shadowSoftSm}>
        {membersLoading ? (
          <ActivityIndicator size="small" color={editorial.primaryContainer} className="py-5" />
        ) : (
          (members ?? []).map((member, index) => (
            <View
              key={member.id}
              className={`flex-row items-center py-2.5 ${index === 0 ? 'border-t-0' : 'border-t border-ed-outline-variant'}`}
            >
              <View className="flex-1">
                <Text className="font-work-sans-bold text-sm text-ed-on-surface">
                  {member.user?.name ?? member.user?.email ?? 'Team member'}
                </Text>
                {member.user?.email && (
                  <Text className="font-work-sans text-xs text-ed-on-surface-variant mt-0.5">
                    {member.user.email}
                  </Text>
                )}
              </View>
              <View className="bg-ed-surface-container-low rounded px-2.5 py-1">
                <Text className="font-work-sans-bold text-[11px] text-ed-on-surface-variant">
                  {ROLE_LABELS[member.role]}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {canManage && (
        <>
          <SectionTitle>Invite a team member</SectionTitle>
          <InviteForm vendorId={vendor.id} businessName={vendor.business_name} ownerCanInviteManager={myRole === 'owner'} />

          {(invitations ?? []).length > 0 && (
            <>
              <SectionTitle>Pending invitations</SectionTitle>
              <View className={CARD_CLASS} style={shadowSoftSm}>
                {(invitations ?? []).map((invitation, index) => (
                  <View
                    key={invitation.id}
                    className={`flex-row items-center py-2.5 ${index === 0 ? 'border-t-0' : 'border-t border-ed-outline-variant'}`}
                  >
                    <View className="flex-1">
                      <Text className="font-work-sans-bold text-[13px] text-ed-on-surface">{invitation.email}</Text>
                      <Text className="font-work-sans text-[11px] text-ed-on-surface-variant mt-0.5">
                        {ROLE_LABELS[invitation.role]} · expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        Alert.alert('Revoke this invite?', invitation.email, [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Revoke',
                            style: 'destructive',
                            onPress: () => revokeMutation.mutate({ invitationId: invitation.id, vendorId: vendor.id }),
                          },
                        ])
                      }
                      className="p-1.5"
                    >
                      <Ionicons name="trash-outline" size={18} color={editorial.onSurfaceVariant} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </>
          )}
        </>
      )}
    </ScreenWrapper>
  );
}
