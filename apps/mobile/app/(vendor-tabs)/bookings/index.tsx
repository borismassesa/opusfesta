import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@opusfesta/lib';
import { ApprovalBanner } from '@/components/vendor/ApprovalBanner';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { useVendorBookings } from '@/hooks/useVendorBookingsPipeline';
import { BOOKING_FILTERS, bookingStageStyle } from '@/lib/vendorPipeline';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import type { BookingStage } from '@/types/vendor';

export default function BookingsScreen() {
  const { editorial } = useTheme();
  const router = useRouter();
  const { vendor, approvalState } = useCurrentVendor();
  const [filter, setFilter] = useState<BookingStage | 'all'>('all');
  const { data: bookings, isLoading } = useVendorBookings(vendor?.id, filter);

  const locked = approvalState.kind === 'pending' || approvalState.kind === 'suspended';

  return (
    <SafeAreaView className="flex-1 bg-of-cream" edges={['top']}>
      <View className="px-5 pt-2">
        <Text className="font-dancing-script-bold text-[28px] text-ed-primary-container mb-4">
          Bookings
        </Text>

        {locked && <ApprovalBanner state={approvalState} />}

        {!locked && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {BOOKING_FILTERS.map((option) => {
                const active = filter === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setFilter(option.key)}
                    className={`px-4 py-2 rounded-[20px] border ${
                      active ? 'bg-ed-primary-container border-ed-primary-container' : 'bg-ed-surface-container-lowest border-ed-outline-variant'
                    }`}
                  >
                    <Text className={`font-work-sans-bold text-xs ${active ? 'text-white' : 'text-ed-on-surface-variant'}`}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      {!locked && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 12 }}>
          {isLoading ? (
            <ActivityIndicator size="small" color={editorial.primaryContainer} className="mt-10" />
          ) : (bookings ?? []).length === 0 ? (
            <View
              className="bg-ed-surface-container-lowest p-5 rounded-[20px] border border-ed-outline-variant"
              style={shadowSoftSm}
            >
              <Text className="font-work-sans-medium text-[13px] text-ed-on-surface-variant">
                No bookings here yet. Accepted leads move here once confirmed.
              </Text>
            </View>
          ) : (
            (bookings ?? []).map((booking) => {
              const style = bookingStageStyle(booking.stage);
              return (
                <Pressable
                  key={booking.id}
                  onPress={() => router.push(`/(vendor-tabs)/bookings/${booking.id}` as Href)}
                  className="p-4 bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant"
                  style={shadowSoftSm}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-3">
                      <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface">
                        {booking.partner_a} &amp; {booking.partner_b}
                      </Text>
                      <Text className="font-work-sans text-xs text-ed-on-surface-variant mt-0.5">
                        {new Date(booking.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {booking.package_name}
                      </Text>
                      <Text className="font-work-sans-bold text-[13px] text-ed-on-surface mt-1.5">
                        {formatCurrency(booking.total_value)}
                      </Text>
                    </View>
                    <View className="rounded px-2.5 py-1" style={{ backgroundColor: style.bg }}>
                      <Text className="font-work-sans-bold text-[11px]" style={{ color: style.fg }}>{style.label}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
