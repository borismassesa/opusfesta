import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@opusfesta/lib';
import { ApprovalBanner } from '@/components/vendor/ApprovalBanner';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { useVendorBookings } from '@/hooks/useVendorBookingsPipeline';
import { BOOKING_FILTERS, bookingStageStyle } from '@/lib/vendorPipeline';
import { editorial, shadowSoftSm } from '@/constants/theme';
import type { BookingStage } from '@/types/vendor';

export default function BookingsScreen() {
  const router = useRouter();
  const { vendor, approvalState } = useCurrentVendor();
  const [filter, setFilter] = useState<BookingStage | 'all'>('all');
  const { data: bookings, isLoading } = useVendorBookings(vendor?.id, filter);

  const locked = approvalState.kind === 'pending' || approvalState.kind === 'suspended';

  return (
    <SafeAreaView className="flex-1 bg-of-cream" edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Text style={{ fontFamily: 'DancingScript-Bold', fontSize: 28, color: editorial.primaryContainer, marginBottom: 16 }}>
          Bookings
        </Text>

        {locked && <ApprovalBanner state={approvalState} />}

        {!locked && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {BOOKING_FILTERS.map((option) => {
                const active = filter === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setFilter(option.key)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: active ? editorial.primaryContainer : editorial.surfaceContainerLowest,
                      borderWidth: 1,
                      borderColor: active ? editorial.primaryContainer : editorial.outlineVariant,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'WorkSans-Bold',
                        fontSize: 12,
                        color: active ? '#fff' : editorial.onSurfaceVariant,
                      }}
                    >
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
            <ActivityIndicator size="small" color={editorial.primaryContainer} style={{ marginTop: 40 }} />
          ) : (bookings ?? []).length === 0 ? (
            <View
              style={[
                {
                  backgroundColor: editorial.surfaceContainerLowest,
                  padding: 20,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: editorial.outlineVariant,
                },
                shadowSoftSm,
              ]}
            >
              <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 13, color: editorial.onSurfaceVariant }}>
                No bookings here yet. Accepted leads move here once confirmed.
              </Text>
            </View>
          ) : (
            (bookings ?? []).map((booking) => {
              const style = bookingStageStyle(booking.stage);
              return (
                <Pressable
                  key={booking.id}
                  onPress={() => router.push(`/(vendor-tabs)/bookings/${booking.id}` as any)}
                  style={[
                    {
                      padding: 16,
                      backgroundColor: editorial.surfaceContainerLowest,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: editorial.outlineVariant,
                    },
                    shadowSoftSm,
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface }}>
                        {booking.partner_a} &amp; {booking.partner_b}
                      </Text>
                      <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 2 }}>
                        {new Date(booking.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {booking.package_name}
                      </Text>
                      <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.onSurface, marginTop: 6 }}>
                        {formatCurrency(booking.total_value)}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: style.bg, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: style.fg }}>{style.label}</Text>
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
