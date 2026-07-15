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
      <Text className="font-dancing-script-bold text-[28px] text-ed-primary-container mb-4">
        Calendar
      </Text>

      {locked && <ApprovalBanner state={approvalState} />}

      {!locked && (
        <>
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => goToMonth(-1)} className="p-2">
              <Ionicons name="chevron-back" size={20} color={editorial.primaryContainer} />
            </Pressable>
            <Text className="font-space-grotesk-bold text-[17px] text-ed-on-surface">
              {formatMonthTitle(year, monthIndex)}
            </Text>
            <Pressable onPress={() => goToMonth(1)} className="p-2">
              <Ionicons name="chevron-forward" size={20} color={editorial.primaryContainer} />
            </Pressable>
          </View>

          <View
            className="bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-4"
            style={shadowSoftSm}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={editorial.primaryContainer} className="py-10" />
            ) : (
              <MonthGrid year={year} monthIndex={monthIndex} statusByDate={statusByDate} onSelectDate={handleSelectDate} />
            )}
          </View>

          <View className="flex-row gap-4 mt-4 flex-wrap">
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-[4px] bg-ed-primary-container" />
              <Text className="font-work-sans-medium text-xs text-ed-on-surface-variant">Booked</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-3 h-3 rounded-[4px] bg-[#FCE8E6]" />
              <Text className="font-work-sans-medium text-xs text-ed-on-surface-variant">Blocked by you</Text>
            </View>
            <Text className="font-work-sans text-xs text-ed-on-surface-variant">
              {readOnly ? 'View only' : 'Tap a date to toggle'}
            </Text>
          </View>
        </>
      )}
    </ScreenWrapper>
  );
}
