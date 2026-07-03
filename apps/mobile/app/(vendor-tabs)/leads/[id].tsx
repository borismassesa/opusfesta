import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, TextInput, type StyleProp, type ViewStyle } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@opusfesta/lib';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useVendorLead, useRespondToLead, useUpdateLeadStatus, useSendProposal, useAcceptCounter } from '@/hooks/useVendorLeads';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { leadStatusStyle } from '@/lib/vendorPipeline';
import { editorial, shadowSoftSm } from '@/constants/theme';
import type { InquiryRow } from '@/types/vendor';

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

function ProposalField({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: editorial.onSurfaceVariant, marginBottom: 4 }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={editorial.onSurfaceVariant}
        style={{
          backgroundColor: editorial.surfaceContainerLowest,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: editorial.outlineVariant,
          padding: 12,
          fontFamily: 'WorkSans-Regular',
          fontSize: 14,
          color: editorial.onSurface,
        }}
        {...props}
      />
    </View>
  );
}

function ProposalSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 12, color: editorial.onSurfaceVariant }}>{label}</Text>
      <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.onSurface, flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

function ProposalSection({ lead }: { lead: InquiryRow }) {
  const sendMutation = useSendProposal();
  const acceptMutation = useAcceptCounter();
  const { myRole } = useCurrentVendor();
  // Accepting a counter creates the vendor_bookings row, which staff can't
  // insert (RLS owner/manager) - hide the action for them.
  const canAccept = myRole !== 'staff';

  const [composing, setComposing] = useState(false);
  const [amount, setAmount] = useState('');
  const [packageName, setPackageName] = useState('');
  const [eventDate, setEventDate] = useState(lead.event_date ?? '');
  const [venue, setVenue] = useState(lead.location ?? '');
  const [guestCount, setGuestCount] = useState(lead.guest_count != null ? String(lead.guest_count) : '');
  const [details, setDetails] = useState('');

  if (lead.status === 'declined' || lead.status === 'closed') return null;

  const submit = () => {
    const invoiceAmount = Number(amount);
    if (!Number.isInteger(invoiceAmount) || invoiceAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter the proposal amount in TZS.');
      return;
    }
    sendMutation.mutate(
      {
        inquiry: { id: lead.id, status: lead.status },
        draft: {
          eventDate: eventDate.trim() || null,
          venue: venue.trim(),
          guestCount: Number(guestCount) > 0 ? Number(guestCount) : null,
          packageName: packageName.trim(),
          invoiceAmount,
          invoiceDetails: details.trim(),
        },
      },
      { onSuccess: () => setComposing(false) }
    );
  };

  const handleAcceptCounter = () => {
    const counterAmount = lead.proposal_counter_amount ?? lead.proposal_invoice_amount ?? 0;
    Alert.alert(
      'Accept counter offer?',
      `This books the event at ${formatCurrency(counterAmount)} and blocks the date on your calendar.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => acceptMutation.mutate({ inquiry: lead }) },
      ]
    );
  };

  const heading = (
    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface, marginBottom: 8 }}>
      Proposal
    </Text>
  );

  if (composing || (!lead.proposal_status && lead.status !== 'accepted')) {
    if (!composing) {
      return (
        <>
          {heading}
          <View style={cardStyle}>
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant, marginBottom: 12 }}>
              Send a formal quote with a price and event details. The couple can accept it or counter.
            </Text>
            <Pressable
              onPress={() => setComposing(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
            >
              <Ionicons name="document-text-outline" size={16} color={editorial.primaryContainer} />
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.primaryContainer }}>
                Compose proposal
              </Text>
            </Pressable>
          </View>
        </>
      );
    }

    return (
      <>
        {heading}
        <View style={cardStyle}>
          <ProposalField label="Amount (TZS)" value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))} placeholder="5000000" keyboardType="number-pad" />
          <ProposalField label="Package" value={packageName} onChangeText={setPackageName} placeholder="Full day coverage" />
          <ProposalField label="Event date" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
          <ProposalField label="Venue" value={venue} onChangeText={setVenue} placeholder="Venue or area" />
          <ProposalField label="Guest count" value={guestCount} onChangeText={(v) => setGuestCount(v.replace(/[^0-9]/g, ''))} placeholder="250" keyboardType="number-pad" />
          <ProposalField label="Details" value={details} onChangeText={setDetails} placeholder="What's included" multiline />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <Pressable onPress={() => setComposing(false)} style={{ flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: editorial.outlineVariant }}>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.onSurfaceVariant }}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={sendMutation.isPending}
              onPress={submit}
              style={{ flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: editorial.primaryContainer, opacity: sendMutation.isPending ? 0.5 : 1 }}
            >
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: '#fff' }}>
                {sendMutation.isPending ? 'Sending…' : 'Send proposal'}
              </Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  if (!lead.proposal_status) return null;

  return (
    <>
      {heading}
      <View style={cardStyle}>
        <ProposalSummaryRow label="Amount" value={formatCurrency(lead.proposal_invoice_amount ?? 0)} />
        {lead.proposal_package && <ProposalSummaryRow label="Package" value={lead.proposal_package} />}
        {lead.proposal_event_date && <ProposalSummaryRow label="Event date" value={lead.proposal_event_date} />}
        {lead.proposal_venue && <ProposalSummaryRow label="Venue" value={lead.proposal_venue} />}
        {lead.proposal_guest_count != null && <ProposalSummaryRow label="Guests" value={String(lead.proposal_guest_count)} />}
        {lead.proposal_invoice_details && (
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant, marginTop: 4 }}>
            {lead.proposal_invoice_details}
          </Text>
        )}

        {lead.proposal_status === 'sent' && (
          <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 10 }}>
            Sent — waiting for the couple's response.
          </Text>
        )}

        {lead.proposal_status === 'accepted' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: '#16a34a' }}>
              Accepted — see Bookings for next steps.
            </Text>
          </View>
        )}

        {lead.proposal_status === 'declined' && (
          <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 10 }}>
            The couple declined this proposal.
          </Text>
        )}

        {lead.proposal_status === 'countered' && (
          <>
            <View style={{ backgroundColor: editorial.tertiaryFixed, borderRadius: 12, padding: 12, marginTop: 12 }}>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: editorial.onSurfaceVariant }}>
                Counter offer
              </Text>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: editorial.onSurface, marginTop: 4 }}>
                {formatCurrency(lead.proposal_counter_amount ?? 0)}
              </Text>
              {lead.proposal_counter_message && (
                <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurface, marginTop: 6, lineHeight: 18 }}>
                  {lead.proposal_counter_message}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <Pressable
                onPress={() => {
                  setAmount(lead.proposal_counter_amount != null ? String(lead.proposal_counter_amount) : '');
                  setPackageName(lead.proposal_package ?? '');
                  setEventDate(lead.proposal_event_date ?? lead.event_date ?? '');
                  setVenue(lead.proposal_venue ?? lead.location ?? '');
                  setGuestCount(lead.proposal_guest_count != null ? String(lead.proposal_guest_count) : '');
                  setDetails(lead.proposal_invoice_details ?? '');
                  setComposing(true);
                }}
                style={{ flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: editorial.outlineVariant }}
              >
                <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.onSurfaceVariant }}>Revise</Text>
              </Pressable>
              {canAccept && (
                <Pressable
                  disabled={acceptMutation.isPending}
                  onPress={handleAcceptCounter}
                  style={{ flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: editorial.onSurface, opacity: acceptMutation.isPending ? 0.5 : 1 }}
                >
                  <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: '#fff' }}>
                    {acceptMutation.isPending ? 'Accepting…' : 'Accept counter'}
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>
    </>
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

      <ProposalSection lead={lead} />

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
