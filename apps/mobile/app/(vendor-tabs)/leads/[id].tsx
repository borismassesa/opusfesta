import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useVendorLead, useRespondToLead, useUpdateLeadStatus } from '@/hooks/useVendorLeads';
import { leadStatusStyle } from '@/lib/vendorPipeline';
import { editorial, shadowSoftSm } from '@/constants/theme';

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
      <Ionicons name={icon} size={16} color={editorial.onSurfaceVariant} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: editorial.onSurfaceVariant }}>
          {label}
        </Text>
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurface, marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: lead, isLoading } = useVendorLead(id);
  const respondMutation = useRespondToLead();
  const statusMutation = useUpdateLeadStatus();
  const [response, setResponse] = useState('');

  if (isLoading || !lead) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="small" color={editorial.primaryContainer} style={{ marginTop: 60 }} />
      </ScreenWrapper>
    );
  }

  const style = leadStatusStyle(lead.status);

  const handleDecide = (status: 'accepted' | 'declined') => {
    Alert.alert(
      status === 'accepted' ? 'Accept this lead?' : 'Decline this lead?',
      status === 'accepted'
        ? "The event date will be blocked on your calendar once accepted."
        : 'You can still message this couple later if you change your mind.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status === 'accepted' ? 'Accept' : 'Decline',
          style: status === 'declined' ? 'destructive' : 'default',
          onPress: () => statusMutation.mutate({ id: lead.id, status }),
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4, marginRight: 8 }}>
          <Ionicons name="chevron-back" size={24} color={editorial.primaryContainer} />
        </Pressable>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: editorial.onSurface, flex: 1 }} numberOfLines={1}>
          {lead.name}
        </Text>
        <View style={{ backgroundColor: style.bg, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: style.fg }}>{style.label}</Text>
        </View>
      </View>

      <View
        style={[
          {
            backgroundColor: editorial.surfaceContainerLowest,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: editorial.outlineVariant,
            padding: 18,
            marginBottom: 20,
          },
          shadowSoftSm,
        ]}
      >
        <DetailRow icon="mail-outline" label="Email" value={lead.email} />
        {lead.phone && <DetailRow icon="call-outline" label="Phone" value={lead.phone} />}
        <DetailRow icon="sparkles-outline" label="Event type" value={lead.event_type} />
        {lead.event_date && (
          <DetailRow
            icon="calendar-outline"
            label="Event date"
            value={new Date(lead.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          />
        )}
        {lead.guest_count != null && <DetailRow icon="people-outline" label="Guest count" value={String(lead.guest_count)} />}
        {lead.budget && <DetailRow icon="wallet-outline" label="Budget" value={lead.budget} />}
        {lead.location && <DetailRow icon="location-outline" label="Location" value={lead.location} />}
      </View>

      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface, marginBottom: 8 }}>
        Message
      </Text>
      <View
        style={[
          {
            backgroundColor: editorial.surfaceContainerLowest,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: editorial.outlineVariant,
            padding: 16,
            marginBottom: 20,
          },
          shadowSoftSm,
        ]}
      >
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurface, lineHeight: 20 }}>
          {lead.message}
        </Text>
      </View>

      {lead.vendor_response && (
        <>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface, marginBottom: 8 }}>
            Your response
          </Text>
          <View
            style={[
              {
                backgroundColor: editorial.tertiaryFixed,
                borderRadius: 20,
                padding: 16,
                marginBottom: 20,
              },
            ]}
          >
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurface, lineHeight: 20 }}>
              {lead.vendor_response}
            </Text>
          </View>
        </>
      )}

      {lead.status !== 'accepted' && lead.status !== 'declined' && lead.status !== 'closed' && (
        <>
          <TextInput
            value={response}
            onChangeText={setResponse}
            placeholder="Write a response to this couple…"
            placeholderTextColor={editorial.onSurfaceVariant}
            multiline
            style={{
              backgroundColor: editorial.surfaceContainerLowest,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: editorial.outlineVariant,
              padding: 16,
              minHeight: 90,
              fontFamily: 'WorkSans-Regular',
              fontSize: 14,
              color: editorial.onSurface,
              marginBottom: 12,
              textAlignVertical: 'top',
            }}
          />
          <Pressable
            disabled={!response.trim() || respondMutation.isPending}
            onPress={() => respondMutation.mutate({ id: lead.id, response: response.trim() })}
            style={{
              backgroundColor: editorial.primaryContainer,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 12,
              opacity: !response.trim() || respondMutation.isPending ? 0.5 : 1,
            }}
          >
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 14, color: '#fff' }}>
              {respondMutation.isPending ? 'Sending…' : 'Send response'}
            </Text>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              disabled={statusMutation.isPending}
              onPress={() => handleDecide('declined')}
              style={{
                flex: 1,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: editorial.outlineVariant,
              }}
            >
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 14, color: editorial.onSurfaceVariant }}>Decline</Text>
            </Pressable>
            <Pressable
              disabled={statusMutation.isPending}
              onPress={() => handleDecide('accepted')}
              style={{
                flex: 1,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: editorial.onSurface,
              }}
            >
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 14, color: '#fff' }}>Accept</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScreenWrapper>
  );
}
