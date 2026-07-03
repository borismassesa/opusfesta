import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ApprovalBanner } from '@/components/vendor/ApprovalBanner';
import { useOpusFestaAuth } from '@/lib/auth';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { getVendorDashboardStats } from '@/lib/api/vendorProfile';
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
  const client = useAuthenticatedSupabase();
  const router = useRouter();
  const { vendor, approvalState, isLoading: vendorLoading } = useCurrentVendor();
  const { editorial } = useTheme();

  const { data, isLoading: statsLoading } = useQuery({
    queryKey: ['vendor-dashboard', vendor?.id],
    queryFn: () => getVendorDashboardStats(client, vendor!.id),
    enabled: !!vendor?.id,
  });

  if (vendorLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: editorial.bg }}>
        <ActivityIndicator size="small" color={editorial.primaryContainer} />
      </View>
    );
  }

  const stats = data?.stats ?? vendor?.stats ?? {};
  const isLive = approvalState.kind === 'active';

  return (
    <ScreenWrapper>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <View>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: editorial.onSurfaceVariant }}>
            Welcome back
          </Text>
          <Text style={{ fontFamily: 'DancingScript-Bold', fontSize: 30, color: editorial.primaryContainer }} numberOfLines={1}>
            {vendor?.business_name ?? user?.name ?? 'Your business'}
          </Text>
        </View>
        <Pressable style={{ padding: 4 }} onPress={() => router.push('/(vendor-tabs)/storefront' as any)}>
          <Ionicons name="settings-outline" size={24} color={editorial.primaryContainer} />
        </Pressable>
      </View>

      {(approvalState.kind === 'pending' || approvalState.kind === 'suspended') && (
        <ApprovalBanner state={approvalState} />
      )}

      {isLive && (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
            {STAT_TILES.map((tile) => (
              <View
                key={tile.key}
                style={[
                  {
                    flexBasis: '47%',
                    flexGrow: 1,
                    backgroundColor: editorial.surfaceContainerLowest,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: editorial.outlineVariant,
                    padding: 18,
                  },
                  shadowSoftSm,
                ]}
              >
                <Ionicons name={tile.icon} size={20} color={editorial.primaryContainer} />
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: editorial.onSurface, marginTop: 10 }}>
                  {statsLoading ? '—' : String((stats as any)[tile.key] ?? 0)}
                </Text>
                <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 2 }}>
                  {tile.label}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              {
                borderRadius: 24,
                padding: 22,
                marginBottom: 24,
                backgroundColor: editorial.primaryContainer,
              },
              shadowSoftPrimary,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                Leads waiting on you
              </Text>
            </View>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 30, color: '#fff' }}>
              {statsLoading ? '—' : `${data?.pendingLeadCount ?? 0} new`}
            </Text>
            <Pressable onPress={() => router.push('/(vendor-tabs)/leads' as any)} style={{ marginTop: 10 }}>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: '#fff' }}>View leads →</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="briefcase-outline" size={20} color={editorial.primaryContainer} />
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: editorial.onSurface }}>
                Upcoming bookings
              </Text>
            </View>
            <Pressable onPress={() => router.push('/(vendor-tabs)/bookings' as any)}>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.primaryContainer }}>
                See all
              </Text>
            </Pressable>
          </View>

          {(data?.upcomingBookings ?? []).length === 0 ? (
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
                No upcoming bookings yet. Accepted leads will show up here.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {(data?.upcomingBookings ?? []).map((booking: any) => (
                <View
                  key={booking.id}
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
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: editorial.onSurface }}>
                    {new Date(booking.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 2, textTransform: 'capitalize' }}>
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
