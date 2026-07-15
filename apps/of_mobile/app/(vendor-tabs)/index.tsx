import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ApprovalBanner } from '@/components/vendor/ApprovalBanner';
import { useOpusFestaAuth } from '@/lib/auth';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { useVendorDashboardStats } from '@/hooks/useVendorProfile';
import { shadowSoftSm, shadowSoftPrimary } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

const STAT_TILES: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'viewCount', label: 'Profile views', icon: 'eye-outline' },
  { key: 'inquiryCount', label: 'Total leads', icon: 'mail-outline' },
  { key: 'saveCount', label: 'Saves', icon: 'heart-outline' },
  { key: 'averageRating', label: 'Rating', icon: 'star-outline' },
];

export default function VendorHomeScreen() {
  const { user } = useOpusFestaAuth();
  const router = useRouter();
  const { vendor, approvalState, isLoading: vendorLoading } = useCurrentVendor();
  const { editorial } = useTheme();

  const { data, isLoading: statsLoading } = useVendorDashboardStats(vendor?.id);

  if (vendorLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ed-bg">
        <ActivityIndicator size="small" color={editorial.primaryContainer} />
      </View>
    );
  }

  const stats = data?.stats ?? vendor?.stats ?? {};
  const isLive = approvalState.kind === 'active';

  return (
    <ScreenWrapper>
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="font-work-sans-bold text-[10px] tracking-[2px] uppercase text-ed-on-surface-variant">
            Welcome back
          </Text>
          <Text className="font-dancing-script-bold text-[30px] text-ed-primary-container" numberOfLines={1}>
            {vendor?.business_name ?? user?.name ?? 'Your business'}
          </Text>
        </View>
        <Pressable className="p-1" onPress={() => router.push('/(vendor-tabs)/storefront')}>
          <Ionicons name="settings-outline" size={24} color={editorial.primaryContainer} />
        </Pressable>
      </View>

      {(approvalState.kind === 'pending' || approvalState.kind === 'suspended') && (
        <ApprovalBanner state={approvalState} />
      )}

      {isLive && (
        <>
          <View className="flex-row flex-wrap gap-3 mb-7">
            {STAT_TILES.map((tile) => (
              <View
                key={tile.key}
                className="basis-[47%] grow bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-[18px]"
                style={shadowSoftSm}
              >
                <Ionicons name={tile.icon} size={20} color={editorial.primaryContainer} />
                <Text className="font-space-grotesk-bold text-2xl text-ed-on-surface mt-2.5">
                  {statsLoading ? '—' : String((stats as Record<string, number>)[tile.key] ?? 0)}
                </Text>
                <Text className="font-work-sans-medium text-xs text-ed-on-surface-variant mt-0.5">
                  {tile.label}
                </Text>
              </View>
            ))}
          </View>

          <View className="rounded-3xl p-[22px] mb-6 bg-ed-primary-container" style={shadowSoftPrimary}>
            <View className="flex-row items-center justify-between mb-1">
              <Text className="font-work-sans-bold text-[10px] tracking-[2px] uppercase text-white/70">
                Leads waiting on you
              </Text>
            </View>
            <Text className="font-space-grotesk-bold text-[30px] text-white">
              {statsLoading ? '—' : `${data?.pendingLeadCount ?? 0} new`}
            </Text>
            <Pressable onPress={() => router.push('/(vendor-tabs)/leads')} className="mt-2.5">
              <Text className="font-work-sans-bold text-[13px] text-white">View leads →</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between mb-3.5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="briefcase-outline" size={20} color={editorial.primaryContainer} />
              <Text className="font-space-grotesk-bold text-lg text-ed-on-surface">
                Upcoming bookings
              </Text>
            </View>
            <Pressable onPress={() => router.push('/(vendor-tabs)/bookings')}>
              <Text className="font-work-sans-bold text-[13px] text-ed-primary-container">
                See all
              </Text>
            </Pressable>
          </View>

          {(data?.upcomingBookings ?? []).length === 0 ? (
            <View
              className="bg-ed-surface-container-lowest p-5 rounded-[20px] border border-ed-outline-variant"
              style={shadowSoftSm}
            >
              <Text className="font-work-sans-medium text-[13px] text-ed-on-surface-variant">
                No upcoming bookings yet. Accepted leads will show up here.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {(data?.upcomingBookings ?? []).map((booking) => (
                <View
                  key={booking.id}
                  className="p-4 bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant"
                  style={shadowSoftSm}
                >
                  <Text className="font-space-grotesk-bold text-sm text-ed-on-surface">
                    {new Date(booking.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Text className="font-work-sans text-xs text-ed-on-surface-variant mt-0.5 capitalize">
                    {booking.stage}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScreenWrapper>
  );
}
