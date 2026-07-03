import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { VendorCard } from '@/components/vendors/VendorCard';
import { useOpusFestaAuth } from '@/lib/auth';
import { getFeaturedVendors } from '@/lib/api/vendors';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

// Keys are the actual `vendors.category` DB values — see VENDOR_CATEGORIES in constants/theme.ts.
const CATEGORIES: { label: string; key: string | null }[] = [
  { label: 'All', key: null },
  { label: 'Venues', key: 'Venues' },
  { label: 'Photo', key: 'Photographers' },
  { label: 'Catering', key: 'Caterers' },
  { label: 'Decor', key: 'Decorators' },
];

export default function HomeScreen() {
  const { editorial } = useTheme();
  const { user } = useOpusFestaAuth();
  const router = useRouter();

  const { data: featuredVendors = [] } = useQuery({
    queryKey: ['vendors', 'featured'],
    queryFn: getFeaturedVendors,
  });

  return (
    <ScreenWrapper>
      {/* Greeting */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <View>
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 13,
              color: editorial.onSurfaceVariant,
            }}
          >
            Good morning
          </Text>
          <Text
            style={{
              fontFamily: 'PlayfairDisplay-Bold',
              fontSize: 24,
              color: editorial.onSurface,
            }}
          >
            Discover vendors
          </Text>
        </View>
        <Pressable onPress={() => router.push('/profile-settings')}>
          <Avatar name={user?.name ?? undefined} imageUrl={user?.imageUrl} />
        </Pressable>
      </View>

      {/* Search */}
      <Pressable
        onPress={() => router.push('/(tabs)/categories')}
        style={[
          {
            backgroundColor: editorial.surfaceContainerLowest,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          },
          shadowSoftSm,
        ]}
      >
        <Ionicons name="search-outline" size={18} color={editorial.onSurfaceVariant} />
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.outline }}>
          Search venues, caterers...
        </Text>
      </Pressable>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 24 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat.label}
            label={cat.label}
            active={false}
            onPress={() =>
              router.push(
                cat.key
                  ? { pathname: '/(tabs)/categories', params: { category: cat.key } }
                  : '/(tabs)/categories'
              )
            }
          />
        ))}
      </ScrollView>

      {/* Featured vendors */}
      <Text
        style={{
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 18,
          letterSpacing: -0.3,
          color: editorial.onSurface,
          marginBottom: 14,
        }}
      >
        Featured vendors
      </Text>
      {featuredVendors.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
          contentContainerStyle={{ gap: 14 }}
        >
          {featuredVendors.map((vendor: any) => (
            <VendorCard
              key={vendor.id}
              id={vendor.id}
              name={vendor.business_name}
              category={vendor.category}
              location={vendor.location?.city}
              rating={vendor.stats?.averageRating ?? 0}
              ratingCount={vendor.stats?.reviewCount ?? 0}
              priceRange={vendor.price_range}
              coverImage={vendor.cover_image}
            />
          ))}
        </ScrollView>
      ) : (
        <Text
          style={{
            fontFamily: 'WorkSans-Regular',
            fontSize: 14,
            color: editorial.onSurfaceVariant,
            marginBottom: 24,
          }}
        >
          No featured vendors yet — check back soon.
        </Text>
      )}
    </ScreenWrapper>
  );
}
