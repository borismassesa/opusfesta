import { useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ApprovalBanner } from '@/components/vendor/ApprovalBanner';
import { MonthGrid, type DayStatus } from '@/components/calendar/MonthGrid';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { useVendorAvailability, useSetVendorAvailability } from '@/hooks/useVendorAvailability';
import { getMonthGridDates, formatMonthTitle } from '@/lib/calendarMonth';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

// The DB trigger that blocks a date on lead acceptance writes this exact
// reason (sync_inquiry_to_availability in 007_vendor_availability.sql) - use
// it to tell an accepted-booking block apart from a manual one.
const TRIGGER_REASON = 'Booked via inquiry';

export default function VendorCalendarScreen() {
  const { editorial } = useTheme();
  const { vendor, myRole, approvalState } = useCurrentVendor();
  // vendor_availability write RLS only permits owner/manager — staff get a
  // read-only calendar rather than toggles that would fail on save.
  const readOnly = myRole === 'staff';
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());

  const cells = useMemo(() => getMonthGridDates(year, monthIndex), [year, monthIndex]);
  const rangeStart = cells[0].date;
  const rangeEnd = cells[cells.length - 1].date;

  const { data: days, isLoading } = useVendorAvailability(vendor?.id, rangeStart, rangeEnd);
  const setAvailability = useSetVendorAvailability(vendor?.id);

  const locked = approvalState.kind === 'pending' || approvalState.kind === 'suspended';

  const statusByDate: Record<string, DayStatus> = {};
  (days ?? []).forEach((d) => {
    if (d.is_available) return;
    statusByDate[d.date] = d.reason === TRIGGER_REASON ? 'booked' : 'manually-blocked';
  });

  const goToMonth = (delta: number) => {
    const next = new Date(Date.UTC(year, monthIndex + delta, 1));
    setYear(next.getUTCFullYear());
    setMonthIndex(next.getUTCMonth());
  };

  const handleSelectDate = (date: string) => {
    const status = statusByDate[date] ?? 'open';
    if (readOnly) {
      if (status !== 'open') {
        Alert.alert(
          status === 'booked' ? 'Booked' : 'Blocked',
          status === 'booked' ? 'This date is blocked by an accepted lead.' : 'This date was blocked by the owner or a manager.'
        );
      }
      return;
    }
    if (status === 'booked') {
      Alert.alert('Booked', 'This date is blocked by an accepted lead. Manage it from Leads or Bookings.');
      return;
    }

    if (status === 'manually-blocked') {
      Alert.alert('Mark this date available again?', date, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark available', onPress: () => setAvailability.mutate({ date, isAvailable: true }) },
      ]);
      return;
    }

    Alert.alert('Block this date?', date, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () => setAvailability.mutate({ date, isAvailable: false, reason: 'Blocked by vendor' }),
      },
    ]);
  };

  return (
    <ScreenWrapper scrollable={false}>
      <Text style={{ fontFamily: 'DancingScript-Bold', fontSize: 28, color: editorial.primaryContainer, marginBottom: 16 }}>
        Calendar
      </Text>

      {locked && <ApprovalBanner state={approvalState} />}

      {!locked && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Pressable onPress={() => goToMonth(-1)} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={20} color={editorial.primaryContainer} />
            </Pressable>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 17, color: editorial.onSurface }}>
              {formatMonthTitle(year, monthIndex)}
            </Text>
            <Pressable onPress={() => goToMonth(1)} style={{ padding: 8 }}>
              <Ionicons name="chevron-forward" size={20} color={editorial.primaryContainer} />
            </Pressable>
          </View>

          <View
            style={[
              {
                backgroundColor: editorial.surfaceContainerLowest,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: editorial.outlineVariant,
                padding: 16,
              },
              shadowSoftSm,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={editorial.primaryContainer} style={{ paddingVertical: 40 }} />
            ) : (
              <MonthGrid year={year} monthIndex={monthIndex} statusByDate={statusByDate} onSelectDate={handleSelectDate} />
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: editorial.primaryContainer }} />
              <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 12, color: editorial.onSurfaceVariant }}>Booked</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: '#FCE8E6' }} />
              <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 12, color: editorial.onSurfaceVariant }}>Blocked by you</Text>
            </View>
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant }}>
              {readOnly ? 'View only' : 'Tap a date to toggle'}
            </Text>
          </View>
        </>
      )}
    </ScreenWrapper>
  );
}
