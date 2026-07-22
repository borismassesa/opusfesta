import { useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GuestAvatar } from '@/components/scanner/GuestAvatar';
import { PartyBadge } from '@/components/scanner/PartyBadge';
import { useTheme } from '@/theme/useTheme';
import type { RosterEntry } from '@/types/checkin';

/** Brand green, matching the live/active pills used elsewhere in the product. */
const LIVE_GREEN = '#9FE870';

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface GuestConfirmCardProps {
  visible: boolean;
  guest: RosterEntry | null;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (guest: RosterEntry) => void;
}

/**
 * Confirmation step between picking a guest and admitting them.
 *
 * Manual check-in is the one path with no QR to verify against, so the only
 * safeguard is the attendant reading the right row. A tap that admitted
 * somebody instantly made a mis-tap silent and unrecoverable — first-scan-wins
 * means the real guest then arrives to find themselves already inside. Showing
 * the guest large, with their ticket code and party size, turns that into a
 * deliberate act.
 */
export function GuestConfirmCard({
  visible,
  guest: incomingGuest,
  busy = false,
  onCancel,
  onConfirm,
}: GuestConfirmCardProps) {
  const { editorial } = useTheme();

  // Callers clear the selection to close, which would empty the card before
  // the sheet has finished sliding away. Holding the last guest keeps the
  // dismissal looking like a dismissal rather than a blank flash.
  const lastGuest = useRef<RosterEntry | null>(null);
  if (incomingGuest) lastGuest.current = incomingGuest;
  const guest = incomingGuest ?? lastGuest.current;

  if (!guest) return null;

  const arrived = Boolean(guest.checkedInAt);
  const admitted = guest.checkedInPartySize ?? guest.partySize;

  const DetailRow = ({
    icon,
    label,
    value,
    first,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    first?: boolean;
  }) => (
    <View
      className={`flex-row items-center gap-3 py-4 ${first ? '' : 'border-t border-ed-outline-variant'}`}
    >
      <Ionicons name={icon} size={20} color={editorial.onSurfaceVariant} />
      <View className="min-w-0 flex-1">
        <Text className="font-work-sans-semibold text-[15px] text-ed-on-surface">
          {label}
        </Text>
        <Text className="mt-0.5 font-work-sans text-sm text-ed-on-surface-variant">
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView className="flex-1 bg-ed-bg">
        {/* Header carries the group the way a delivery app carries the order
            it belongs to: it's the fastest way to catch "right name, wrong
            side of the family". */}
        <View className="flex-row items-center gap-3 px-4 pb-3 pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to the guest list"
            onPress={onCancel}
            hitSlop={12}
            className="h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: editorial.surfaceContainer }}
          >
            <Ionicons name="arrow-back" size={20} color={editorial.onSurface} />
          </Pressable>
          <View className="min-w-0 flex-1 flex-row items-center justify-center gap-2">
            <GuestAvatar fullName={guest.groupTag || guest.fullName} size={26} colorKey={guest.groupTag} />
            <Text
              className="shrink font-work-sans-semibold text-[15px] text-ed-on-surface"
              numberOfLines={1}
            >
              {guest.groupTag || 'Guest list'}
            </Text>
          </View>
          <View className="h-10 w-10 shrink-0" />
        </View>

        <ScrollView contentContainerClassName="pb-4">
          {/* Portrait panel standing in for the product shot: the guest is
              what's being identified, so they get the same visual weight. */}
          <View className="mx-4 items-center justify-center rounded-3xl bg-ed-surface-container py-10">
            <GuestAvatar fullName={guest.fullName} size={112} colorKey={guest.groupTag} />
            {guest.isVip ? (
              <View
                className="mt-5 rounded-full px-3 py-1"
                style={{ backgroundColor: LIVE_GREEN }}
              >
                <Text
                  className="font-work-sans-bold text-[10px] uppercase tracking-[1.5px]"
                  style={{ color: '#1A1A1A' }}
                >
                  {guest.groupTag || 'VIP'}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="px-5 pt-5">
            <View className="flex-row items-start gap-3">
              <View className="min-w-0 flex-1">
                <Text className="font-playfair-bold text-[26px] leading-8 text-ed-on-surface">
                  {guest.fullName}
                </Text>
                {/* The badge beside the name states the ticket type, so the
                    subtitle carries only the printed code. */}
                {guest.entryCode ? (
                  <Text className="mt-1 font-work-sans text-sm text-ed-on-surface-variant">
                    {guest.entryCode}
                  </Text>
                ) : null}
              </View>
              {/* Named in the language the tickets are sold in — the guest is
                  holding a Single or a Double, not "1 ct". */}
              <PartyBadge partySize={guest.partySize} />
            </View>

            {arrived ? (
              <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-ed-outline-variant p-4">
                <Ionicons name="alert-circle-outline" size={22} color="#B4751A" />
                <View className="min-w-0 flex-1">
                  <Text className="font-work-sans-semibold text-[15px] text-ed-on-surface">
                    Already checked in
                  </Text>
                  <Text className="mt-0.5 font-work-sans text-sm text-ed-on-surface-variant">
                    {admitted} of {guest.partySize} admitted at{' '}
                    {timeOf(guest.checkedInAt!)}
                    {guest.checkedInDoor ? ` · ${guest.checkedInDoor}` : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-ed-outline-variant p-4">
                <Ionicons
                  name="create-outline"
                  size={22}
                  color={editorial.onSurfaceVariant}
                />
                <View className="min-w-0 flex-1">
                  <Text className="font-work-sans-semibold text-[15px] text-ed-on-surface">
                    Check the guest is who you expect
                  </Text>
                  <Text className="mt-0.5 font-work-sans text-sm text-ed-on-surface-variant">
                    No pass was scanned, so this is recorded as a manual
                    check-in on the couple&apos;s report.
                  </Text>
                </View>
              </View>
            )}

            <Text className="mt-7 font-work-sans-bold text-lg text-ed-on-surface">
              Guest details
            </Text>
            <View className="mt-1">
              <DetailRow
                first
                icon="list-outline"
                label="Group"
                value={guest.groupTag || 'No group'}
              />
              <DetailRow
                icon="barcode-outline"
                label="Ticket code"
                value={guest.entryCode ?? 'Not issued'}
              />
              <DetailRow
                icon="people-outline"
                label="Expected party"
                value={`${guest.partySize} ${guest.partySize === 1 ? 'person' : 'people'}`}
              />
            </View>
          </View>
        </ScrollView>

        {/* Stacked, full width and thumb-height: the attendant is one-handed
            with a phone in the other hand's light. */}
        <View className="border-t border-ed-outline-variant px-4 pb-2 pt-3">
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            disabled={busy}
            className="h-14 items-center justify-center rounded-2xl bg-ed-surface-container"
          >
            <Text className="font-work-sans-semibold text-base text-ed-on-surface">
              Not this guest
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: arrived || busy }}
            disabled={arrived || busy}
            onPress={() => onConfirm(guest)}
            className="mt-3 h-14 items-center justify-center rounded-2xl bg-ed-primary-container"
            style={{ opacity: arrived || busy ? 0.5 : 1 }}
          >
            {busy ? (
              <ActivityIndicator color={editorial.onPrimary} />
            ) : (
              <Text className="font-work-sans-bold text-base text-ed-on-primary">
                {arrived
                  ? 'Already checked in'
                  : guest.partySize > 1
                    ? `Check in party of ${guest.partySize}`
                    : 'Check in'}
              </Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
