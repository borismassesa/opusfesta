import { View, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useOpusFestaAuth } from '@/lib/auth';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getDashboardData } from '@/lib/api/events';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { editorial, shadowSoftSm, shadowSoftPrimary, VENDOR_CATEGORIES } from '@/constants/theme';

function iconForCategory(category: string | null | undefined): keyof typeof Ionicons.glyphMap {
  return (VENDOR_CATEGORIES.find((c) => c.key === category)?.icon ?? 'storefront-outline') as keyof typeof Ionicons.glyphMap;
}

export default function DashboardScreen() {
  const { user } = useOpusFestaAuth();
  const client = useAuthenticatedSupabase();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(client),
  });

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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Pressable style={{ padding: 4 }} onPress={() => router.push('/profile-settings')}>
          <Ionicons name="menu" size={24} color={editorial.primaryContainer} />
        </Pressable>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: 'DancingScript-Bold',
            fontSize: 30,
            color: editorial.primaryContainer,
          }}
        >
          {displayName}
        </Text>
        <Pressable style={{ position: 'relative', padding: 4 }} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={editorial.primaryContainer} />
          {unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: editorial.error,
              }}
            />
          )}
        </Pressable>
      </View>

      {/* Countdown Banner */}
      <View
        style={[
          {
            borderRadius: 24,
            padding: 24,
            marginBottom: 28,
            backgroundColor: editorial.primaryContainer,
          },
          shadowSoftPrimary,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text
              style={{
                fontFamily: 'WorkSans-Bold',
                fontSize: 10,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 4,
              }}
            >
              The Big Day Countdown
            </Text>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 32,
                color: '#ffffff',
              }}
            >
              {daysLeft !== null ? `${daysLeft} days left` : 'No date yet'}
            </Text>
            <Text
              style={{
                fontFamily: 'WorkSans-Regular',
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
                marginTop: 8,
              }}
            >
              {weddingDate}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              width: 64,
              height: 64,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="calendar-outline" size={32} color="#fff" />
          </View>
        </View>
      </View>

      {/* Budget & Checklist */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Ionicons name="checkbox-outline" size={20} color={editorial.primaryContainer} />
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: editorial.onSurface }}>
          Budget &amp; Checklist
        </Text>
      </View>
      <View
        style={[
          {
            backgroundColor: editorial.surfaceContainerLowest,
            padding: 20,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: editorial.outlineVariant,
            marginBottom: 28,
          },
          shadowSoftSm,
        ]}
      >
        <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 13, color: editorial.onSurfaceVariant }}>
          Budget tracking and a wedding checklist are coming soon.
        </Text>
      </View>

      {/* Booked Vendors */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="storefront-outline" size={20} color={editorial.primaryContainer} />
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: editorial.onSurface }}>
            Booked Vendors
          </Text>
        </View>
        <Pressable>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.primaryContainer }}>
            Manage
          </Text>
        </Pressable>
      </View>
      {bookedVendors.length === 0 ? (
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
            No booked vendors yet. Save a vendor as booked from their profile to see it here.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {bookedVendors.map((booking: any) => (
            <View
              key={booking.id}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  backgroundColor: editorial.surfaceContainerLowest,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: editorial.outlineVariant,
                },
                shadowSoftSm,
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: editorial.tertiaryFixed,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={iconForCategory(booking.vendors?.category)} size={22} color={editorial.tertiaryContainer} />
                </View>
                <View>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: editorial.onSurface }}>
                    {booking.vendors?.business_name ?? 'Vendor'}
                  </Text>
                  <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant }}>
                    {booking.vendors?.category ?? ''}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: '#e8f5e9',
                  borderRadius: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: '#c8e6c9',
                }}
              >
                <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
                <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: '#16a34a' }}>
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
