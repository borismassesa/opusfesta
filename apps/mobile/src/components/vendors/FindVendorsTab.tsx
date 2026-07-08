import { useState } from 'react';
import { View, Text, Pressable, FlatList, Image, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { getVendorsByCategory, searchVendors } from '@/lib/api/vendors';
import { formatCompactCurrencyRange } from '@opusfesta/lib';
import { shadowSoft, shadowSoftSm } from '@/constants/theme';
import { BROWSE_CATEGORIES } from '@/constants/vendorCategories';
import { useCoupleProfile } from '@/hooks/useCoupleProfile';
import { useTheme } from '@/theme/useTheme';

const EMOJI_MAP: Record<string, string> = {};

const GRID_PADDING = 20;
const GRID_GAP = 14;
const GRID_COLUMNS = 2;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CATEGORY_TILE_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

export function FindVendorsTab() {
  const { editorial } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: coupleProfile } = useCoupleProfile();

  const isSearching = searchQuery.trim().length > 0;

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors', 'browse', 'Venues'],
    queryFn: () => getVendorsByCategory('Venues'),
    enabled: !isSearching,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['vendors', 'search', searchQuery],
    queryFn: () => searchVendors(searchQuery.trim()),
    enabled: isSearching,
  });

  const displayVendors = (isSearching ? searchResults : vendors).map((v: any) => ({
    id: v.id,
    business_name: v.business_name,
    location: v.location,
    category: v.category,
    categoryLabel: v.category,
    rating: v.stats?.averageRating ?? null,
    reviews: v.stats?.reviewCount ?? 0,
    price_min: v.price_range?.min ?? null,
    price_max: v.price_range?.max ?? null,
    cover_image: v.cover_image,
    featured: v.tier === 'premium',
    tagline: v.subcategories?.[0] ?? null,
  }));

  const heroVendor = isSearching ? null : displayVendors.find((v: any) => v.featured) || displayVendors[0];
  const listVendors = isSearching ? displayVendors : displayVendors.filter((v: any) => v.id !== heroVendor?.id);

  return (
    <FlatList
      data={listVendors}
      keyExtractor={(item: any) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      ListHeaderComponent={
        <>
          {/* ─── Location ─── */}
          <View style={{ paddingHorizontal: GRID_PADDING, paddingTop: 16, marginBottom: 20 }}>
            <Pressable
              onPress={() => router.push('/profile-settings')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 15, color: editorial.onSurfaceVariant }}>
                Find vendors in{' '}
                <Text style={{ fontFamily: 'WorkSans-Bold', color: editorial.onSurface }}>
                  {coupleProfile?.city || 'your area'}
                </Text>
              </Text>
              <Ionicons name="pencil" size={13} color={editorial.onSurfaceVariant} />
            </Pressable>
          </View>

          {/* ─── Category Grid ─── */}
          <View style={{ paddingHorizontal: GRID_PADDING, marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: GRID_GAP }}>
              {BROWSE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => router.push(`/(tabs)/categories/${cat.key}`)}
                  style={{ width: CATEGORY_TILE_WIDTH, marginBottom: 18 }}
                >
                  <View
                    style={[
                      {
                        width: '100%',
                        aspectRatio: 1,
                        borderRadius: 16,
                        overflow: 'hidden',
                      },
                      shadowSoftSm,
                    ]}
                  >
                    <Image source={{ uri: cat.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </View>
                  <Text
                    style={{
                      fontFamily: 'WorkSans-Bold',
                      fontSize: 15,
                      color: editorial.onSurface,
                      marginTop: 8,
                    }}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ─── Search Bar ─── */}
          <View style={{ paddingHorizontal: GRID_PADDING, marginBottom: 24 }}>
            <View
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: editorial.surfaceContainerLowest,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  gap: 10,
                },
                shadowSoftSm,
              ]}
            >
              <Ionicons name="search-outline" size={18} color={editorial.outline} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search vendors, venues..."
                placeholderTextColor={editorial.outline}
                style={{
                  flex: 1,
                  fontFamily: 'WorkSans-Regular',
                  fontSize: 15,
                  color: editorial.onSurface,
                  paddingVertical: 14,
                }}
              />
              <Pressable
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: editorial.surfaceContainerHigh,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="options-outline" size={16} color={editorial.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          {/* ─── Hero / Featured Vendor ─── */}
          {heroVendor && (
            <View style={{ paddingHorizontal: GRID_PADDING, marginBottom: 28 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk-Bold',
                    fontSize: 18,
                    letterSpacing: -0.3,
                    color: editorial.onSurface,
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
                  <Ionicons name="sparkles" size={14} color={editorial.tertiaryContainer} />
                  <Text
                    style={{
                      fontFamily: 'WorkSans-Bold',
                      fontSize: 10,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: editorial.tertiaryContainer,
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
                    backgroundColor: editorial.surfaceContainerLowest,
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: editorial.outlineVariant,
                  },
                  shadowSoft,
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
                      colors={[editorial.tertiaryContainer, editorial.secondaryContainer, editorial.tertiaryFixed]}
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
                      backgroundColor: editorial.primaryContainer,
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
                    <Ionicons name="heart-outline" size={18} color={editorial.primaryContainer} />
                  </Pressable>
                </View>
                {/* Hero Content */}
                <View style={{ padding: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <View
                      style={{
                        backgroundColor: editorial.tertiaryFixed,
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
                          color: editorial.tertiaryContainer,
                        }}
                      >
                        {heroVendor.categoryLabel}
                      </Text>
                    </View>
                    {heroVendor.rating != null && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="star" size={12} color="#C4920A" />
                        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: editorial.onSurface }}>
                          {heroVendor.rating}
                        </Text>
                        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant }}>
                          ({heroVendor.reviews})
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk-Bold',
                      fontSize: 20,
                      letterSpacing: -0.3,
                      color: editorial.onSurface,
                      marginBottom: 4,
                    }}
                  >
                    {heroVendor.business_name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'WorkSans-Regular',
                      fontSize: 14,
                      color: editorial.onSurfaceVariant,
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
                      borderTopColor: editorial.surfaceContainerHigh,
                    }}
                  >
                    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.primaryContainer }}>
                      {formatCompactCurrencyRange(heroVendor.price_min, heroVendor.price_max)}
                    </Text>
                    <View
                      style={[
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: editorial.primaryContainer,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 8,
                        },
                        shadowSoftSm,
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
          <View style={{ paddingHorizontal: GRID_PADDING, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontSize: 18,
                  letterSpacing: -0.3,
                  color: editorial.onSurface,
                }}
              >
                {isSearching ? 'Search Results' : 'All Vendors'}
              </Text>
              <Text
                style={{
                  fontFamily: 'WorkSans-Bold',
                  fontSize: 12,
                  color: editorial.onSurfaceVariant,
                }}
              >
                {listVendors.length} found
              </Text>
            </View>
          </View>
        </>
      }
      renderItem={({ item }: any) => (
        <Pressable
          onPress={() => router.push(`/vendor/${item.id}`)}
          style={[
            {
              flexDirection: 'row',
              marginHorizontal: GRID_PADDING,
              marginBottom: 12,
              backgroundColor: editorial.surfaceContainerLowest,
              borderRadius: 12,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: editorial.outlineVariant,
            },
            shadowSoftSm,
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
                colors={[editorial.secondaryContainer, editorial.tertiaryFixed]}
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
                  backgroundColor: editorial.tertiaryFixed,
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
                    color: editorial.tertiaryContainer,
                  }}
                >
                  {item.categoryLabel}
                </Text>
              </View>
              {item.rating != null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Ionicons name="star" size={10} color="#C4920A" />
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: editorial.onSurface }}>
                    {item.rating}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 15,
                letterSpacing: -0.2,
                color: editorial.onSurface,
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
                color: editorial.onSurfaceVariant,
                marginBottom: 8,
              }}
              numberOfLines={1}
            >
              {item.location?.city}
              {item.tagline ? ` · ${item.tagline}` : ''}
            </Text>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: editorial.primaryContainer }}>
              {formatCompactCurrencyRange(item.price_min, item.price_max)}
            </Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
          <Ionicons name="search-outline" size={48} color={editorial.outlineVariant} />
          <Text
            style={{
              fontFamily: 'PlayfairDisplay-Bold',
              fontSize: 18,
              color: editorial.onSurface,
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
              color: editorial.onSurfaceVariant,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Try a different category or search term
          </Text>
        </View>
      }
    />
  );
}
