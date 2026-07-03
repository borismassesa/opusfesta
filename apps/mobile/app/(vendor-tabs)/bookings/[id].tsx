import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@opusfesta/lib';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useVendorBooking, useAdvanceBookingStage } from '@/hooks/useVendorBookingsPipeline';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { bookingStageStyle, nextBookingStage, BOOKING_FILTERS } from '@/lib/vendorPipeline';
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

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={done ? '#16a34a' : editorial.outline} />
      <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 13, color: done ? editorial.onSurface : editorial.onSurfaceVariant }}>
        {label}
      </Text>
    </View>
  );
}

export default function BookingDetailScreen() {
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
        <ActivityIndicator size="small" color={editorial.primaryContainer} style={{ marginTop: 60 }} />
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4, marginRight: 8 }}>
          <Ionicons name="chevron-back" size={24} color={editorial.primaryContainer} />
        </Pressable>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: editorial.onSurface, flex: 1 }} numberOfLines={1}>
          {booking.partner_a} &amp; {booking.partner_b}
        </Text>
        <View style={{ backgroundColor: style.bg, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: style.fg }}>{style.label}</Text>
        </View>
      </View>

      <View
        style={[
          {
            backgroundColor: editorial.primaryContainer,
            borderRadius: 24,
            padding: 22,
            marginBottom: 20,
          },
        ]}
      >
        <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
          Total value
        </Text>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 30, color: '#fff', marginTop: 4 }}>
          {formatCurrency(booking.total_value)}
        </Text>
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          {booking.deposit_percent}% deposit {booking.deposit_paid ? '· paid' : '· pending'}
        </Text>
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

      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface, marginBottom: 8 }}>
        Checklist
      </Text>
      <View
        style={[
          {
            backgroundColor: editorial.surfaceContainerLowest,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: editorial.outlineVariant,
            padding: 16,
            marginBottom: 24,
          },
          shadowSoftSm,
        ]}
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
          style={{
            backgroundColor: editorial.onSurface,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: advanceMutation.isPending ? 0.5 : 1,
          }}
        >
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 14, color: '#fff' }}>
            {advanceMutation.isPending ? 'Updating…' : `Move to "${upcomingLabel}"`}
          </Text>
        </Pressable>
      )}
    </ScreenWrapper>
  );
}
