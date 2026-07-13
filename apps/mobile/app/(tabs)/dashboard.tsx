import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useOpusFestaAuth } from '@/lib/auth';
import { useDashboardData } from '@/hooks/useEvents';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { shadowSoftSm, shadowSoftPrimary, VENDOR_CATEGORIES } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

function iconForCategory(category: string | null | undefined): keyof typeof Ionicons.glyphMap {
  return (VENDOR_CATEGORIES.find((c) => c.key === category)?.icon ?? 'storefront-outline') as keyof typeof Ionicons.glyphMap;
}

export default function DashboardScreen() {
  const { editorial } = useTheme();
  const { user } = useOpusFestaAuth();
  const router = useRouter();

  const { data } = useDashboardData();

  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const event = data?.event;
  const bookedVendors = data?.bookings ?? [];
  const daysLeft = event?.date
    ? Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const weddingDate = event?.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Add your wedding date to see a countdown';

  const displayName = event?.name ?? user?.name ?? 'Your wedding';

  return (
    <ScreenWrapper>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Pressable className="p-1" onPress={() => router.push('/profile-settings')}>
          <Ionicons name="menu" size={24} color={editorial.primaryContainer} />
        </Pressable>
        <Text numberOfLines={1} className="font-dancing-script-bold text-[30px] text-ed-primary-container">
          {displayName}
        </Text>
        <Pressable className="relative p-1" onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={editorial.primaryContainer} />
          {unreadCount > 0 && (
            <View className="absolute top-1 right-1 w-2 h-2 rounded-[4px] bg-ed-error" />
          )}
        </Pressable>
      </View>

      {/* Countdown Banner */}
      <View className="rounded-3xl p-6 mb-7 bg-ed-primary-container" style={shadowSoftPrimary}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-work-sans-bold text-[10px] tracking-[3px] uppercase text-white/70 mb-1">
              The Big Day Countdown
            </Text>
            <Text className="font-space-grotesk-bold text-[32px] text-white">
              {daysLeft !== null ? `${daysLeft} days left` : 'No date yet'}
            </Text>
            <Text className="font-work-sans text-[13px] text-white/60 mt-2">
              {weddingDate}
            </Text>
          </View>
          <View className="bg-white/15 w-16 h-16 rounded-xl items-center justify-center">
            <Ionicons name="calendar-outline" size={32} color="#fff" />
          </View>
        </View>
      </View>

      {/* Budget & Checklist */}
      <View className="flex-row items-center gap-2 mb-3.5">
        <Ionicons name="checkbox-outline" size={20} color={editorial.primaryContainer} />
        <Text className="font-space-grotesk-bold text-lg text-ed-on-surface">
          Budget &amp; Checklist
        </Text>
      </View>
      <View
        className="bg-ed-surface-container-lowest p-5 rounded-[20px] border border-ed-outline-variant mb-7"
        style={shadowSoftSm}
      >
        <Text className="font-work-sans-medium text-[13px] text-ed-on-surface-variant">
          Budget tracking and a wedding checklist are coming soon.
        </Text>
      </View>

      {/* Booked Vendors */}
      <View className="flex-row items-center justify-between mb-3.5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="storefront-outline" size={20} color={editorial.primaryContainer} />
          <Text className="font-space-grotesk-bold text-lg text-ed-on-surface">
            Booked Vendors
          </Text>
        </View>
        <Pressable>
          <Text className="font-work-sans-bold text-[13px] text-ed-primary-container">
            Manage
          </Text>
        </Pressable>
      </View>
      {bookedVendors.length === 0 ? (
        <View
          className="bg-ed-surface-container-lowest p-5 rounded-[20px] border border-ed-outline-variant"
          style={shadowSoftSm}
        >
          <Text className="font-work-sans-medium text-[13px] text-ed-on-surface-variant">
            No booked vendors yet. Save a vendor as booked from their profile to see it here.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {bookedVendors.map((booking) => (
            <View
              key={booking.id}
              className="flex-row items-center justify-between p-4 bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant"
              style={shadowSoftSm}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-[10px] items-center justify-center bg-ed-tertiary-fixed">
                  <Ionicons name={iconForCategory(booking.vendors?.category)} size={22} color={editorial.tertiaryContainer} />
                </View>
                <View>
                  <Text className="font-space-grotesk-bold text-sm text-ed-on-surface">
                    {booking.vendors?.business_name ?? 'Vendor'}
                  </Text>
                  <Text className="font-work-sans text-xs text-ed-on-surface-variant">
                    {booking.vendors?.category ?? ''}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1 bg-[#e8f5e9] rounded px-2.5 py-1 border border-[#c8e6c9]">
                <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
                <Text className="font-work-sans-bold text-[11px] text-[#16a34a]">
                  Booked
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenWrapper>
  );
}
