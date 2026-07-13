import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@opusfesta/lib';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useVendorBooking, useAdvanceBookingStage } from '@/hooks/useVendorBookingsPipeline';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { bookingStageStyle, nextBookingStage, BOOKING_FILTERS } from '@/lib/vendorPipeline';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

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

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  const { editorial } = useTheme();
  return (
    <View className="flex-row items-center gap-2.5 py-2">
      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={done ? '#16a34a' : editorial.outline} />
      <Text className={`font-work-sans-medium text-[13px] ${done ? 'text-ed-on-surface' : 'text-ed-on-surface-variant'}`}>
        {label}
      </Text>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { editorial } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: booking, isLoading } = useVendorBooking(id);
  const advanceMutation = useAdvanceBookingStage();
  // Staff are read-only on bookings — vendor_bookings UPDATE RLS only
  // permits owner/manager, so hide the write action rather than let it fail.
  const { myRole } = useCurrentVendor();
  const canAdvance = myRole !== 'staff';

  if (isLoading || !booking) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="small" color={editorial.primaryContainer} className="mt-[60px]" />
      </ScreenWrapper>
    );
  }

  const style = bookingStageStyle(booking.stage);
  const upcoming = nextBookingStage(booking.stage);
  const upcomingLabel = upcoming ? BOOKING_FILTERS.find((f) => f.key === upcoming)?.label : null;

  const handleAdvance = () => {
    if (!upcoming || !upcomingLabel) return;
    Alert.alert(`Move to "${upcomingLabel}"?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () =>
          advanceMutation.mutate({
            id: booking.id,
            stage: upcoming,
            label: `Moved to ${upcomingLabel}`,
            currentTimeline: booking.timeline,
          }),
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <View className="flex-row items-center mb-5">
        <Pressable onPress={() => router.back()} className="p-1 mr-2">
          <Ionicons name="chevron-back" size={24} color={editorial.primaryContainer} />
        </Pressable>
        <Text className="font-space-grotesk-bold text-xl text-ed-on-surface flex-1" numberOfLines={1}>
          {booking.partner_a} &amp; {booking.partner_b}
        </Text>
        <View className="rounded px-2.5 py-1" style={{ backgroundColor: style.bg }}>
          <Text className="font-work-sans-bold text-[11px]" style={{ color: style.fg }}>{style.label}</Text>
        </View>
      </View>

      <View className="rounded-3xl p-[22px] mb-5 bg-ed-primary-container">
        <Text className="font-work-sans-bold text-[10px] tracking-[2px] uppercase text-white/70">
          Total value
        </Text>
        <Text className="font-space-grotesk-bold text-[30px] text-white mt-1">
          {formatCurrency(booking.total_value)}
        </Text>
        <Text className="font-work-sans text-xs text-white/70 mt-1">
          {booking.deposit_percent}% deposit {booking.deposit_paid ? '· paid' : '· pending'}
        </Text>
      </View>

      <View
        className="bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-[18px] mb-5"
        style={shadowSoftSm}
      >
        <DetailRow
          icon="calendar-outline"
          label="Event date"
          value={new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        />
        <DetailRow icon="time-outline" label="Time" value={`${booking.start_time} – ${booking.end_time}`} />
        <DetailRow icon="pricetag-outline" label="Package" value={booking.package_name} />
        <DetailRow icon="location-outline" label="Location" value={booking.location} />
        <DetailRow icon="mail-outline" label="Email" value={booking.email} />
        {booking.phone && <DetailRow icon="call-outline" label="Phone" value={booking.phone} />}
      </View>

      <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface mb-2">
        Checklist
      </Text>
      <View
        className="bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-4 mb-6"
        style={shadowSoftSm}
      >
        <ChecklistRow label="Deposit paid" done={booking.deposit_paid} />
        <ChecklistRow label="Contract sent" done={!!booking.contract_sent_at} />
        <ChecklistRow label="Contract signed" done={booking.contract_signed} />
        <ChecklistRow label="Invoice issued" done={booking.invoice_issued} />
        <ChecklistRow label="Event brief submitted" done={booking.brief_submitted} />
      </View>

      {canAdvance && upcoming && booking.stage !== 'cancelled' && (
        <Pressable
          disabled={advanceMutation.isPending}
          onPress={handleAdvance}
          className={`bg-ed-on-surface rounded-[14px] py-3.5 items-center ${advanceMutation.isPending ? 'opacity-50' : 'opacity-100'}`}
        >
          <Text className="font-work-sans-bold text-sm text-white">
            {advanceMutation.isPending ? 'Updating…' : `Move to "${upcomingLabel}"`}
          </Text>
        </Pressable>
      )}
    </ScreenWrapper>
  );
}
