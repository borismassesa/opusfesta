import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, TextInput, Share, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { useVendorTeam, useVendorInvitations, useInviteTeamMember, useRevokeInvitation } from '@/hooks/useVendorTeam';
import { editorial, shadowSoftSm } from '@/constants/theme';

const cardStyle: StyleProp<ViewStyle> = [
  {
    backgroundColor: editorial.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: editorial.outlineVariant,
    padding: 16,
    marginBottom: 20,
  },
  shadowSoftSm,
];

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
};

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

function InviteForm({ vendorId, businessName, ownerCanInviteManager }: { vendorId: string; businessName: string; ownerCanInviteManager: boolean }) {
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
        onError: (err: any) => Alert.alert('Could not create invite', err?.message ?? 'Please try again.'),
      }
    );
  };

  if (issuedCode) {
    return (
      <View style={cardStyle}>
        <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: editorial.onSurfaceVariant }}>
          Invite code — shown once
        </Text>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 30, letterSpacing: 4, color: editorial.onSurface, marginVertical: 10 }}>
          {issuedCode}
        </Text>
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant, marginBottom: 12 }}>
          Share it with your team member. They sign up in the OpusFesta app, choose “Join a vendor team”, and enter this code. It expires in 7 days.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() =>
              Share.share({
                message: `You've been invited to join ${businessName} on OpusFesta. Download the app, sign up, choose "Join a vendor team", and enter this code: ${issuedCode}`,
              })
            }
            style={{ flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: editorial.primaryContainer }}
          >
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: '#fff' }}>Share code</Text>
          </Pressable>
          <Pressable
            onPress={() => setIssuedCode(null)}
            style={{ flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: editorial.outlineVariant }}
          >
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.onSurfaceVariant }}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={cardStyle}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="teammate@business.com"
        placeholderTextColor={editorial.onSurfaceVariant}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          backgroundColor: editorial.surfaceContainerLow,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: editorial.outlineVariant,
          padding: 12,
          fontFamily: 'WorkSans-Regular',
          fontSize: 14,
          color: editorial.onSurface,
          marginBottom: 12,
        }}
      />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {(['staff', ...(ownerCanInviteManager ? (['manager'] as const) : [])] as ('staff' | 'manager')[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: role === r ? editorial.onSurface : editorial.surfaceContainerLow,
              borderWidth: 1,
              borderColor: role === r ? editorial.onSurface : editorial.outlineVariant,
            }}
          >
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: role === r ? '#fff' : editorial.onSurfaceVariant }}>
              {ROLE_LABELS[r]}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 11, color: editorial.onSurfaceVariant, marginBottom: 12 }}>
        {role === 'manager'
          ? 'Managers can edit the storefront, manage bookings and the calendar, and invite staff.'
          : 'Staff can view leads, bookings, and the calendar, and message couples.'}
      </Text>
      <Pressable
        disabled={inviteMutation.isPending}
        onPress={submit}
        style={{
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: 'center',
          backgroundColor: editorial.primaryContainer,
          opacity: inviteMutation.isPending ? 0.5 : 1,
        }}
      >
        <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: '#fff' }}>
          {inviteMutation.isPending ? 'Creating…' : 'Create invite code'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function TeamScreen() {
  const { vendor, myRole, isLoading: vendorLoading } = useCurrentVendor();
  const canManage = myRole === 'owner' || myRole === 'manager';
  const { data: members, isLoading: membersLoading } = useVendorTeam(vendor?.id);
  const { data: invitations } = useVendorInvitations(vendor?.id, canManage);
  const revokeMutation = useRevokeInvitation();

  if (vendorLoading || !vendor) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="small" color={editorial.primaryContainer} style={{ marginTop: 60 }} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text style={{ fontFamily: 'DancingScript-Bold', fontSize: 28, color: editorial.primaryContainer, marginBottom: 20 }}>
        Team
      </Text>

      <SectionTitle>Members</SectionTitle>
      <View style={cardStyle}>
        {membersLoading ? (
          <ActivityIndicator size="small" color={editorial.primaryContainer} style={{ paddingVertical: 20 }} />
        ) : (
          (members ?? []).map((member, index) => (
            <View
              key={member.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: editorial.outlineVariant,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 14, color: editorial.onSurface }}>
                  {member.user?.name ?? member.user?.email ?? 'Team member'}
                </Text>
                {member.user?.email && (
                  <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 2 }}>
                    {member.user.email}
                  </Text>
                )}
              </View>
              <View style={{ backgroundColor: editorial.surfaceContainerLow, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: editorial.onSurfaceVariant }}>
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
              <View style={cardStyle}>
                {(invitations ?? []).map((invitation, index) => (
                  <View
                    key={invitation.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: editorial.outlineVariant,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.onSurface }}>{invitation.email}</Text>
                      <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 11, color: editorial.onSurfaceVariant, marginTop: 2 }}>
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
                      style={{ padding: 6 }}
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
