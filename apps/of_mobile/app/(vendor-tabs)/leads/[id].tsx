import { useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@opusfesta/lib';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useVendorLead, useUpdateLeadStatus, useSendProposal, useAcceptCounter } from '@/hooks/useVendorLeads';
import { useInquiryMessages, useSendInquiryMessage } from '@/hooks/useInquiryMessages';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { leadStatusStyle } from '@/lib/vendorPipeline';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import type { InquiryMessage } from '@/lib/api/inquiryMessages';
import type { InquiryRow } from '@/types/vendor';

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { editorial } = useTheme();
  return (
    <View className="flex-row items-start gap-2.5 mb-3.5">
      <Ionicons name={icon} size={16} color={editorial.onSurfaceVariant} style={{ marginTop: 2 }} />
      <View className="flex-1">
        <Text className="font-work-sans-bold text-[10px] tracking-[1px] uppercase text-ed-on-surface-variant">
          {label}
        </Text>
        <Text className="font-work-sans text-sm text-ed-on-surface mt-0.5">{value}</Text>
      </View>
    </View>
  );
}

function ProposalField({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  const { editorial } = useTheme();
  return (
    <View className="mb-3">
      <Text className="font-work-sans-bold text-[10px] tracking-[1px] uppercase text-ed-on-surface-variant mb-1">
        {label}
      </Text>
      <TextInput
        placeholderTextColor={editorial.onSurfaceVariant}
        className="bg-ed-surface-container-lowest rounded-xl border border-ed-outline-variant p-3 font-work-sans text-sm text-ed-on-surface"
        {...props}
      />
    </View>
  );
}

function ProposalSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between mb-2">
      <Text className="font-work-sans-medium text-xs text-ed-on-surface-variant">{label}</Text>
      <Text className="font-work-sans-bold text-xs text-ed-on-surface shrink text-right">{value}</Text>
    </View>
  );
}

const CARD_CLASS = 'bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-4 mb-5';

function ProposalSection({ lead }: { lead: InquiryRow }) {
  const { editorial } = useTheme();
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
    <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface mb-2">
      Proposal
    </Text>
  );

  if (composing || (!lead.proposal_status && lead.status !== 'accepted')) {
    if (!composing) {
      return (
        <>
          {heading}
          <View className={CARD_CLASS} style={shadowSoftSm}>
            <Text className="font-work-sans text-[13px] text-ed-on-surface-variant mb-3">
              Send a formal quote with a price and event details. The couple can accept it or counter.
            </Text>
            <Pressable
              onPress={() => setComposing(true)}
              className="flex-row items-center gap-1.5 self-start"
            >
              <Ionicons name="document-text-outline" size={16} color={editorial.primaryContainer} />
              <Text className="font-work-sans-bold text-[13px] text-ed-primary-container">
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
        <View className={CARD_CLASS} style={shadowSoftSm}>
          <ProposalField label="Amount (TZS)" value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))} placeholder="5000000" keyboardType="number-pad" />
          <ProposalField label="Package" value={packageName} onChangeText={setPackageName} placeholder="Full day coverage" />
          <ProposalField label="Event date" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
          <ProposalField label="Venue" value={venue} onChangeText={setVenue} placeholder="Venue or area" />
          <ProposalField label="Guest count" value={guestCount} onChangeText={(v) => setGuestCount(v.replace(/[^0-9]/g, ''))} placeholder="250" keyboardType="number-pad" />
          <ProposalField label="Details" value={details} onChangeText={setDetails} placeholder="What's included" multiline />
          <View className="flex-row gap-3 mt-1">
            <Pressable onPress={() => setComposing(false)} className="flex-1 rounded-xl py-3 items-center border border-ed-outline-variant">
              <Text className="font-work-sans-bold text-[13px] text-ed-on-surface-variant">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={sendMutation.isPending}
              onPress={submit}
              className={`flex-1 rounded-xl py-3 items-center bg-ed-primary-container ${sendMutation.isPending ? 'opacity-50' : 'opacity-100'}`}
            >
              <Text className="font-work-sans-bold text-[13px] text-white">
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
      <View className={CARD_CLASS} style={shadowSoftSm}>
        <ProposalSummaryRow label="Amount" value={formatCurrency(lead.proposal_invoice_amount ?? 0)} />
        {lead.proposal_package && <ProposalSummaryRow label="Package" value={lead.proposal_package} />}
        {lead.proposal_event_date && <ProposalSummaryRow label="Event date" value={lead.proposal_event_date} />}
        {lead.proposal_venue && <ProposalSummaryRow label="Venue" value={lead.proposal_venue} />}
        {lead.proposal_guest_count != null && <ProposalSummaryRow label="Guests" value={String(lead.proposal_guest_count)} />}
        {lead.proposal_invoice_details && (
          <Text className="font-work-sans text-[13px] text-ed-on-surface-variant mt-1">
            {lead.proposal_invoice_details}
          </Text>
        )}

        {lead.proposal_status === 'sent' && (
          <Text className="font-work-sans-medium text-xs text-ed-on-surface-variant mt-2.5">
            Sent — waiting for the couple's response.
          </Text>
        )}

        {lead.proposal_status === 'accepted' && (
          <View className="flex-row items-center gap-1.5 mt-2.5">
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text className="font-work-sans-bold text-xs text-[#16a34a]">
              Accepted — see Bookings for next steps.
            </Text>
          </View>
        )}

        {lead.proposal_status === 'declined' && (
          <Text className="font-work-sans-medium text-xs text-ed-on-surface-variant mt-2.5">
            The couple declined this proposal.
          </Text>
        )}

        {lead.proposal_status === 'countered' && (
          <>
            <View className="bg-ed-tertiary-fixed rounded-xl p-3 mt-3">
              <Text className="font-work-sans-bold text-[10px] tracking-[1px] uppercase text-ed-on-surface-variant">
                Counter offer
              </Text>
              <Text className="font-space-grotesk-bold text-lg text-ed-on-surface mt-1">
                {formatCurrency(lead.proposal_counter_amount ?? 0)}
              </Text>
              {lead.proposal_counter_message && (
                <Text className="font-work-sans text-[13px] text-ed-on-surface mt-1.5 leading-[18px]">
                  {lead.proposal_counter_message}
                </Text>
              )}
            </View>
            <View className="flex-row gap-3 mt-3">
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
                className="flex-1 rounded-xl py-3 items-center border border-ed-outline-variant"
              >
                <Text className="font-work-sans-bold text-[13px] text-ed-on-surface-variant">Revise</Text>
              </Pressable>
              {canAccept && (
                <Pressable
                  disabled={acceptMutation.isPending}
                  onPress={handleAcceptCounter}
                  className={`flex-1 rounded-xl py-3 items-center bg-ed-on-surface ${acceptMutation.isPending ? 'opacity-50' : 'opacity-100'}`}
                >
                  <Text className="font-work-sans-bold text-[13px] text-white">
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

function ThreadSection({ lead }: { lead: InquiryRow }) {
  const { editorial } = useTheme();
  const { data: messages, isLoading } = useInquiryMessages(lead.id);
  const sendMutation = useSendInquiryMessage();
  const [draft, setDraft] = useState('');

  // Show the single-shot vendor_response as a legacy bubble until a real
  // vendor message exists, same as the couple-facing apps do.
  const thread = useMemo<InquiryMessage[]>(() => {
    const list = messages ?? [];
    if (lead.vendor_response && list.every((m) => m.sender_type !== 'vendor')) {
      return [
        ...list,
        {
          id: 'legacy-reply',
          sender_type: 'vendor' as const,
          sender_name: 'You',
          content: lead.vendor_response,
          attachments: null,
          created_at: lead.responded_at ?? lead.created_at,
          read_at: null,
        },
      ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return list;
  }, [messages, lead.vendor_response, lead.responded_at, lead.created_at]);

  const canCompose = lead.status !== 'declined' && lead.status !== 'closed';

  const submit = () => {
    const content = draft.trim();
    if (!content) return;
    sendMutation.mutate({ inquiryId: lead.id, content }, { onSuccess: () => setDraft('') });
  };

  return (
    <>
      <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface mb-2">
        Conversation
      </Text>
      <View className={CARD_CLASS} style={shadowSoftSm}>
        {isLoading ? (
          <ActivityIndicator size="small" color={editorial.primaryContainer} className="py-5" />
        ) : thread.length === 0 ? (
          <Text className="font-work-sans text-[13px] text-ed-on-surface-variant">
            No messages yet.
          </Text>
        ) : (
          thread.map((message) => {
            const mine = message.sender_type === 'vendor';
            return (
              <View
                key={message.id}
                className={`max-w-[85%] rounded-[14px] p-3 mb-2 ${
                  mine ? 'self-end bg-ed-tertiary-fixed' : 'self-start bg-ed-surface-container-low'
                }`}
              >
                <Text className="font-work-sans-bold text-[10px] tracking-[0.5px] text-ed-on-surface-variant mb-0.5">
                  {mine ? 'You' : message.sender_name}
                </Text>
                <Text className="font-work-sans text-sm text-ed-on-surface leading-[19px]">
                  {message.content}
                </Text>
              </View>
            );
          })
        )}

        {canCompose && (
          <View className="flex-row items-end gap-2 mt-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message…"
              placeholderTextColor={editorial.onSurfaceVariant}
              multiline
              className="flex-1 bg-ed-surface-container-low rounded-[14px] border border-ed-outline-variant px-3 py-2.5 font-work-sans text-sm text-ed-on-surface max-h-[100px]"
            />
            <Pressable
              disabled={!draft.trim() || sendMutation.isPending}
              onPress={submit}
              className={`bg-ed-primary-container rounded-xl p-2.5 ${!draft.trim() || sendMutation.isPending ? 'opacity-50' : 'opacity-100'}`}
            >
              <Ionicons name="send" size={16} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

export default function LeadDetailScreen() {
  const { editorial } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: lead, isLoading } = useVendorLead(id);
  const statusMutation = useUpdateLeadStatus();

  if (isLoading || !lead) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="small" color={editorial.primaryContainer} className="mt-[60px]" />
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
      <View className="flex-row items-center mb-5">
        <Pressable onPress={() => router.back()} className="p-1 mr-2">
          <Ionicons name="chevron-back" size={24} color={editorial.primaryContainer} />
        </Pressable>
        <Text className="font-space-grotesk-bold text-xl text-ed-on-surface flex-1" numberOfLines={1}>
          {lead.name}
        </Text>
        <View className="rounded px-2.5 py-1" style={{ backgroundColor: style.bg }}>
          <Text className="font-work-sans-bold text-[11px]" style={{ color: style.fg }}>{style.label}</Text>
        </View>
      </View>

      <View className="bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-[18px] mb-5" style={shadowSoftSm}>
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

      <ProposalSection lead={lead} />

      <ThreadSection lead={lead} />

      {lead.status !== 'accepted' && lead.status !== 'declined' && lead.status !== 'closed' && (
        <View className="flex-row gap-3">
          <Pressable
            disabled={statusMutation.isPending}
            onPress={() => handleDecide('declined')}
            className="flex-1 rounded-[14px] py-3.5 items-center border border-ed-outline-variant"
          >
            <Text className="font-work-sans-bold text-sm text-ed-on-surface-variant">Decline</Text>
          </Pressable>
          <Pressable
            disabled={statusMutation.isPending}
            onPress={() => handleDecide('accepted')}
            className="flex-1 rounded-[14px] py-3.5 items-center bg-ed-on-surface"
          >
            <Text className="font-work-sans-bold text-sm text-white">Accept</Text>
          </Pressable>
        </View>
      )}
    </ScreenWrapper>
  );
}
