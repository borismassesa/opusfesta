import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { VendorCard } from '@/components/vendors/VendorCard';
import { Card } from '@/components/ui/Card';
import { useOpusFestaAuth } from '@/lib/auth';
import { getFeaturedVendors } from '@/lib/api/vendors';
import { formatCurrency } from '@opusfesta/lib';
import { brutalist, brutalistShadow, brutalistShadowSm } from '@/constants/theme';

const CATEGORIES = ['All', 'Venues', 'Photo', 'Catering', 'Decor'];

const TRENDING_PACKAGES = [
  {
    id: '1',
    title: 'Full day coverage',
    subtitle: 'Photo + Video bundle',
    price: 1500000,
    icon: '📷',
  },
  {
    id: '2',
    title: 'Premium decor set',
    subtitle: '200 guest table setup',
    price: 3200000,
    icon: '🎨',
  },
];

export default function HomeScreen() {
  const { user } = useOpusFestaAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');

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
              color: brutalist.onSurfaceVariant,
            }}
          >
            Good morning
          </Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk-Bold',
              fontSize: 24,
              letterSpacing: -0.5,
              color: brutalist.onSurface,
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
        style={[
          {
            backgroundColor: brutalist.surfaceContainerLowest,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          },
          brutalistShadowSm,
        ]}
      >
        <Ionicons name="search-outline" size={18} color={brutalist.onSurfaceVariant} />
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: brutalist.outline }}>
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
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onPress={() => setActiveCategory(cat)}
          />
        ))}
      </ScrollView>

      {/* Featured vendors */}
      <Text
        style={{
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 18,
          letterSpacing: -0.3,
          color: brutalist.onSurface,
          marginBottom: 14,
        }}
      >
        Featured vendors
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 24 }}
        contentContainerStyle={{ gap: 14 }}
      >
        {featuredVendors.length > 0
          ? featuredVendors.map((vendor: any) => (
              <VendorCard
                key={vendor.id}
                id={vendor.id}
                name={vendor.business_name}
                category={vendor.category}
                location={vendor.location?.city}
                rating={vendor.stats?.rating_avg ?? 0}
                ratingCount={vendor.stats?.review_count ?? 0}
                priceRange={vendor.price_range}
                coverImage={vendor.cover_image}
              />
            ))
          : [
              {
                id: '1',
                name: 'Serena Venues',
                location: 'Dar es Salaam',
                rating: 4.9,
              },
              {
                id: '2',
                name: 'Amina Photography',
                location: 'Arusha',
                rating: 4.7,
              },
            ].map((v) => (
              <VendorCard
                key={v.id}
                id={v.id}
                name={v.name}
                category="venues"
                location={v.location}
                rating={v.rating}
                priceRange={{ min: 2000000 }}
              />
            ))}
      </ScrollView>

      {/* Trending packages */}
      <Text
        style={{
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 18,
          letterSpacing: -0.3,
          color: brutalist.onSurface,
          marginBottom: 14,
        }}
      >
        Trending packages
      </Text>
      <View style={{ gap: 10 }}>
        {TRENDING_PACKAGES.map((pkg) => (
          <View
            key={pkg.id}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                backgroundColor: brutalist.surfaceContainerLowest,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: brutalist.outlineVariant,
              },
              brutalistShadowSm,
            ]}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                backgroundColor: brutalist.tertiaryFixed,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 28 }}>{pkg.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontSize: 15,
                  color: brutalist.onSurface,
                }}
              >
                {pkg.title}
              </Text>
              <Text
                style={{
                  fontFamily: 'WorkSans-Regular',
                  fontSize: 12,
                  color: brutalist.onSurfaceVariant,
                }}
              >
                {pkg.subtitle}
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontSize: 14,
                  color: brutalist.primaryContainer,
                  marginTop: 4,
                }}
              >
                {formatCurrency(pkg.price)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenWrapper>
  );
}
