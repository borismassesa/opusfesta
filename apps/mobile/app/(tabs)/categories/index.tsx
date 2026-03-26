import { useState } from 'react';
import { View, Text, Pressable, FlatList, Image, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVendorsByCategory } from '@/lib/api/vendors';
import { formatCurrency } from '@opusfesta/lib';
import { brutalist, brutalistShadow, brutalistShadowSm, purpleTints, VENDOR_CATEGORIES } from '@/constants/theme';

type IonIcon = keyof typeof Ionicons.glyphMap;

// Extended categories with colors from purple tint scale
const BROWSE_CATEGORIES: {
  key: string;
  label: string;
  icon: IonIcon;
  bg: string;
  iconColor: string;
  emoji: string;
}[] = [
  { key: 'venues', label: 'Venues', icon: 'business-outline', bg: purpleTints[100], iconColor: purpleTints[700], emoji: '🏛️' },
  { key: 'photographers', label: 'Photo', icon: 'camera-outline', bg: purpleTints[50], iconColor: purpleTints[500], emoji: '📸' },
  { key: 'caterers', label: 'Catering', icon: 'restaurant-outline', bg: purpleTints[150], iconColor: purpleTints[800], emoji: '🍽️' },
  { key: 'decor', label: 'Decor', icon: 'sparkles-outline', bg: purpleTints[50], iconColor: purpleTints[700], emoji: '✨' },
  { key: 'djs-mcs', label: 'Music', icon: 'musical-notes-outline', bg: purpleTints[100], iconColor: purpleTints[500], emoji: '🎵' },
  { key: 'designers', label: 'Bridal', icon: 'shirt-outline', bg: purpleTints[150], iconColor: purpleTints[800], emoji: '👗' },
  { key: 'rentals', label: 'Cakes', icon: 'cafe-outline', bg: purpleTints[50], iconColor: purpleTints[700], emoji: '🎂' },
  { key: 'salons-makeup', label: 'Planning', icon: 'clipboard-outline', bg: purpleTints[100], iconColor: purpleTints[500], emoji: '📋' },
];

const DEMO_VENDORS = [
  {
    id: 'demo-1',
    business_name: 'Grand Majestic Hotel',
    location: { city: 'Mlimani City, Dar es Salaam' },
    category: 'venues',
    categoryLabel: 'Venues',
    rating: 4.9,
    reviews: 127,
    price_min: 1500000,
    price_max: 5000000,
    cover_image: null,
    featured: true,
    tagline: 'Up to 800 Guests · Premium',
  },
  {
    id: 'demo-2',
    business_name: 'Oyster Bay Gardens',
    location: { city: 'Msasani Peninsula' },
    category: 'venues',
    categoryLabel: 'Outdoor Venue',
    rating: 4.7,
    reviews: 89,
    price_min: 2000000,
    price_max: 4500000,
    cover_image: null,
    featured: false,
    tagline: 'Garden & Waterfront',
  },
  {
    id: 'demo-3',
    business_name: 'Emerald Sky Deck',
    location: { city: 'Posta CBD' },
    category: 'venues',
    categoryLabel: 'Rooftop',
    rating: 4.8,
    reviews: 63,
    price_min: 1200000,
    price_max: 3000000,
    cover_image: null,
    featured: false,
    tagline: 'City views · Modern',
  },
  {
    id: 'demo-4',
    business_name: 'Lush Lavender Hall',
    location: { city: 'Kijitonyama' },
    category: 'venues',
    categoryLabel: 'Banquet Hall',
    rating: 4.6,
    reviews: 41,
    price_min: 800000,
    price_max: 2500000,
    cover_image: null,
    featured: false,
    tagline: 'Elegant · Affordable',
  },
];

const EMOJI_MAP: Record<string, string> = {
  'demo-1': '🏨',
  'demo-2': '🌿',
  'demo-3': '🌅',
  'demo-4': '💐',
};

export default function CategoriesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors', 'browse', selectedCategory],
    queryFn: () => getVendorsByCategory(selectedCategory || 'Venues'),
  });

  const displayVendors =
    vendors.length > 0
      ? vendors.map((v: any) => ({
          id: v.id,
          business_name: v.business_name,
          location: v.location,
          category: v.category,
          categoryLabel: v.category,
          rating: v.stats?.rating_avg ?? 4.5,
          reviews: v.stats?.review_count ?? 0,
          price_min: v.price_range?.min ?? null,
          price_max: v.price_range?.max ?? null,
          cover_image: v.cover_image,
          featured: v.tier === 'premium',
          tagline: v.subcategories?.[0] ?? null,
        }))
      : DEMO_VENDORS;

  const heroVendor = displayVendors.find((v: any) => v.featured) || displayVendors[0];
  const listVendors = displayVendors.filter((v: any) => v.id !== heroVendor?.id);

  function formatPrice(min: number | null, max: number | null) {
    if (!min && !max) return '';
    if (min && max) {
      const fmtMin = min >= 1000000 ? `${(min / 1000000).toFixed(1)}M` : `${(min / 1000).toFixed(0)}k`;
      const fmtMax = max >= 1000000 ? `${(max / 1000000).toFixed(1)}M` : `${(max / 1000).toFixed(0)}k`;
      return `TZS ${fmtMin} – ${fmtMax}`;
    }
    return min ? `From ${formatCurrency(min)}` : '';
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <FlatList
        data={listVendors}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            {/* ─── Header ─── */}
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
              <Text
                style={{
                  fontFamily: 'WorkSans-Bold',
                  fontSize: 10,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: brutalist.onSurfaceVariant,
                  marginBottom: 4,
                }}
              >
                Explore
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontSize: 26,
                  letterSpacing: -0.5,
                  color: brutalist.onSurface,
                }}
              >
                Find your{' '}
                <Text style={{ color: brutalist.tertiaryContainer }}>dream team</Text>
              </Text>
            </View>

            {/* ─── Search Bar ─── */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <View
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: brutalist.surfaceContainerLowest,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    gap: 10,
                  },
                  brutalistShadowSm,
                ]}
              >
                <Ionicons name="search-outline" size={18} color={brutalist.outline} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search vendors, venues..."
                  placeholderTextColor={brutalist.outline}
                  style={{
                    flex: 1,
                    fontFamily: 'WorkSans-Regular',
                    fontSize: 15,
                    color: brutalist.onSurface,
                    paddingVertical: 14,
                  }}
                />
                <Pressable
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: brutalist.surfaceContainerHigh,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="options-outline" size={16} color={brutalist.onSurfaceVariant} />
                </Pressable>
              </View>
            </View>

            {/* ─── Category Grid ─── */}
            <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
              <Text
                style={{
                  fontFamily: 'WorkSans-Bold',
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: brutalist.onSurfaceVariant,
                  marginBottom: 14,
                }}
              >
                Browse by Category
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {BROWSE_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      onPress={() => setSelectedCategory(isActive ? null : cat.key)}
                      style={[
                        {
                          width: '23%',
                          aspectRatio: 1,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isActive ? brutalist.primaryContainer : cat.bg,
                          borderWidth: isActive ? 0 : 2,
                          borderColor: brutalist.outlineVariant,
                        },
                        brutalistShadowSm,
                      ]}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={24}
                        color={isActive ? '#fff' : cat.iconColor}
                      />
                      <Text
                        style={{
                          fontFamily: 'WorkSans-Bold',
                          fontSize: 10,
                          letterSpacing: 0.5,
                          color: isActive ? '#fff' : brutalist.onSurface,
                          marginTop: 6,
                          textAlign: 'center',
                        }}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ─── Hero / Featured Vendor ─── */}
            {heroVendor && (
              <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk-Bold',
                      fontSize: 18,
                      letterSpacing: -0.3,
                      color: brutalist.onSurface,
                    }}
                  >
                    Featured
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Ionicons name="sparkles" size={14} color={brutalist.tertiaryContainer} />
                    <Text
                      style={{
                        fontFamily: 'WorkSans-Bold',
                        fontSize: 10,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        color: brutalist.tertiaryContainer,
                      }}
                    >
                      Editor's Pick
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => router.push(`/vendor/${heroVendor.id}`)}
                  style={[
                    {
                      backgroundColor: brutalist.surfaceContainerLowest,
                      borderRadius: 16,
                      overflow: 'hidden',
                      borderWidth: 2,
                      borderColor: brutalist.outlineVariant,
                    },
                    brutalistShadow,
                  ]}
                >
                  {/* Hero Image */}
                  <View style={{ height: 200, overflow: 'hidden' }}>
                    {heroVendor.cover_image ? (
                      <Image
                        source={{ uri: heroVendor.cover_image }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={[brutalist.tertiaryContainer, brutalist.secondaryContainer, brutalist.tertiaryFixed]}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Text style={{ fontSize: 56 }}>{EMOJI_MAP[heroVendor.id] ?? '🏛️'}</Text>
                      </LinearGradient>
                    )}
                    {/* Featured badge */}
                    <View
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        backgroundColor: brutalist.primaryContainer,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'WorkSans-Bold',
                          fontSize: 9,
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          color: '#fff',
                        }}
                      >
                        Featured
                      </Text>
                    </View>
                    {/* Heart */}
                    <Pressable
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="heart-outline" size={18} color={brutalist.primaryContainer} />
                    </Pressable>
                  </View>
                  {/* Hero Content */}
                  <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <View
                        style={{
                          backgroundColor: brutalist.tertiaryFixed,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'WorkSans-Bold',
                            fontSize: 10,
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                            color: brutalist.tertiaryContainer,
                          }}
                        >
                          {heroVendor.categoryLabel}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="star" size={12} color="#C4920A" />
                        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: brutalist.onSurface }}>
                          {heroVendor.rating}
                        </Text>
                        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: brutalist.onSurfaceVariant }}>
                          ({heroVendor.reviews})
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontFamily: 'SpaceGrotesk-Bold',
                        fontSize: 20,
                        letterSpacing: -0.3,
                        color: brutalist.onSurface,
                        marginBottom: 4,
                      }}
                    >
                      {heroVendor.business_name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'WorkSans-Regular',
                        fontSize: 14,
                        color: brutalist.onSurfaceVariant,
                        marginBottom: 16,
                      }}
                    >
                      {heroVendor.location?.city}
                      {heroVendor.tagline ? ` · ${heroVendor.tagline}` : ''}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 16,
                        borderTopWidth: 2,
                        borderTopColor: brutalist.surfaceContainerHigh,
                      }}
                    >
                      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: brutalist.primaryContainer }}>
                        {formatPrice(heroVendor.price_min, heroVendor.price_max)}
                      </Text>
                      <View
                        style={[
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: brutalist.primaryContainer,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 8,
                          },
                          brutalistShadowSm,
                        ]}
                      >
                        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#fff' }}>
                          View Details
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color="#fff" />
                      </View>
                    </View>
                  </View>
                </Pressable>
              </View>
            )}

            {/* ─── List Section Header ─── */}
            <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk-Bold',
                    fontSize: 18,
                    letterSpacing: -0.3,
                    color: brutalist.onSurface,
                  }}
                >
                  {selectedCategory
                    ? BROWSE_CATEGORIES.find((c) => c.key === selectedCategory)?.label || 'Results'
                    : 'All Vendors'}
                </Text>
                <Text
                  style={{
                    fontFamily: 'WorkSans-Bold',
                    fontSize: 12,
                    color: brutalist.onSurfaceVariant,
                  }}
                >
                  {listVendors.length} found
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item, index }: any) => (
          <Pressable
            onPress={() => router.push(`/vendor/${item.id}`)}
            style={[
              {
                flexDirection: 'row',
                marginHorizontal: 20,
                marginBottom: 12,
                backgroundColor: brutalist.surfaceContainerLowest,
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: brutalist.outlineVariant,
              },
              brutalistShadowSm,
            ]}
          >
            {/* Thumbnail */}
            <View style={{ width: 110, overflow: 'hidden' }}>
              {item.cover_image ? (
                <Image
                  source={{ uri: item.cover_image }}
                  style={{ width: '100%', height: '100%', minHeight: 120 }}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={[brutalist.secondaryContainer, brutalist.tertiaryFixed]}
                  style={{ width: '100%', minHeight: 120, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 32 }}>{EMOJI_MAP[item.id] ?? '🏛️'}</Text>
                </LinearGradient>
              )}
            </View>
            {/* Content */}
            <View style={{ flex: 1, padding: 14, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <View
                  style={{
                    backgroundColor: brutalist.tertiaryFixed,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 3,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'WorkSans-Bold',
                      fontSize: 9,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: brutalist.tertiaryContainer,
                    }}
                  >
                    {item.categoryLabel}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Ionicons name="star" size={10} color="#C4920A" />
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: brutalist.onSurface }}>
                    {item.rating}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontSize: 15,
                  letterSpacing: -0.2,
                  color: brutalist.onSurface,
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                {item.business_name}
              </Text>
              <Text
                style={{
                  fontFamily: 'WorkSans-Regular',
                  fontSize: 12,
                  color: brutalist.onSurfaceVariant,
                  marginBottom: 8,
                }}
                numberOfLines={1}
              >
                {item.location?.city}
                {item.tagline ? ` · ${item.tagline}` : ''}
              </Text>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: brutalist.primaryContainer }}>
                {formatPrice(item.price_min, item.price_max)}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
            <Ionicons name="search-outline" size={48} color={brutalist.outlineVariant} />
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 18,
                color: brutalist.onSurface,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              No vendors found
            </Text>
            <Text
              style={{
                fontFamily: 'WorkSans-Regular',
                fontSize: 14,
                color: brutalist.onSurfaceVariant,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Try a different category or search term
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
