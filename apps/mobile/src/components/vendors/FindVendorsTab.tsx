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

  const displayVendors = (isSearching ? searchResults : vendors).map((v) => ({
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

  const heroVendor = isSearching ? null : displayVendors.find((v) => v.featured) || displayVendors[0];
  const listVendors = isSearching ? displayVendors : displayVendors.filter((v) => v.id !== heroVendor?.id);

  return (
    <FlatList
      data={listVendors}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      ListHeaderComponent={
        <>
          {/* ─── Location ─── */}
          <View className="px-5 pt-4 mb-5">
            <Pressable
              onPress={() => router.push('/profile-settings')}
              className="flex-row items-center gap-1.5"
            >
              <Text className="font-work-sans text-[15px] text-ed-on-surface-variant">
                Find vendors in{' '}
                <Text className="font-work-sans-bold text-ed-on-surface">
                  {coupleProfile?.city || 'your area'}
                </Text>
              </Text>
              <Ionicons name="pencil" size={13} color={editorial.onSurfaceVariant} />
            </Pressable>
          </View>

          {/* ─── Category Grid ─── */}
          <View className="px-5 mb-7">
            <View className="flex-row flex-wrap gap-x-3.5">
              {BROWSE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => router.push(`/(tabs)/categories/${cat.key}`)}
                  className="mb-[18px]"
                  style={{ width: CATEGORY_TILE_WIDTH }}
                >
                  <View className="w-full aspect-square rounded-2xl overflow-hidden" style={shadowSoftSm}>
                    <Image source={{ uri: cat.image }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <Text className="font-work-sans-bold text-[15px] text-ed-on-surface mt-2">
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ─── Search Bar ─── */}
          <View className="px-5 mb-6">
            <View
              className="flex-row items-center bg-ed-surface-container-lowest rounded-xl px-3.5 gap-2.5"
              style={shadowSoftSm}
            >
              <Ionicons name="search-outline" size={18} color={editorial.outline} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search vendors, venues..."
                placeholderTextColor={editorial.outline}
                className="flex-1 font-work-sans text-[15px] text-ed-on-surface py-3.5"
              />
              <Pressable className="w-8 h-8 rounded-lg items-center justify-center bg-ed-surface-container-high">
                <Ionicons name="options-outline" size={16} color={editorial.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          {/* ─── Hero / Featured Vendor ─── */}
          {heroVendor && (
            <View className="px-5 mb-7">
              <View className="flex-row items-center justify-between mb-3.5">
                <Text className="font-space-grotesk-bold text-lg tracking-[-0.3px] text-ed-on-surface">
                  Featured
                </Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="sparkles" size={14} color={editorial.tertiaryContainer} />
                  <Text className="font-work-sans-bold text-[10px] tracking-[1px] uppercase text-ed-tertiary-container">
                    Editor's Pick
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push(`/vendor/${heroVendor.id}`)}
                className="bg-ed-surface-container-lowest rounded-2xl overflow-hidden border border-ed-outline-variant"
                style={shadowSoft}
              >
                {/* Hero Image */}
                <View className="h-[200px] overflow-hidden">
                  {heroVendor.cover_image ? (
                    <Image
                      source={{ uri: heroVendor.cover_image }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={[editorial.tertiaryContainer, editorial.secondaryContainer, editorial.tertiaryFixed]}
                      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text className="text-[56px]">{EMOJI_MAP[heroVendor.id] ?? '🏛️'}</Text>
                    </LinearGradient>
                  )}
                  {/* Featured badge */}
                  <View className="absolute top-3.5 left-3.5 bg-ed-primary-container px-2.5 py-1 rounded">
                    <Text className="font-work-sans-bold text-[9px] tracking-[2px] uppercase text-white">
                      Featured
                    </Text>
                  </View>
                  {/* Heart */}
                  <Pressable className="absolute top-3.5 right-3.5 w-9 h-9 rounded-lg items-center justify-center bg-white/90">
                    <Ionicons name="heart-outline" size={18} color={editorial.primaryContainer} />
                  </Pressable>
                </View>
                {/* Hero Content */}
                <View className="p-5">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="bg-ed-tertiary-fixed px-2 py-0.5 rounded">
                      <Text className="font-work-sans-bold text-[10px] tracking-[1px] uppercase text-ed-tertiary-container">
                        {heroVendor.categoryLabel}
                      </Text>
                    </View>
                    {heroVendor.rating != null && (
                      <View className="flex-row items-center gap-0.5">
                        <Ionicons name="star" size={12} color="#C4920A" />
                        <Text className="font-space-grotesk-bold text-[13px] text-ed-on-surface">
                          {heroVendor.rating}
                        </Text>
                        <Text className="font-work-sans text-xs text-ed-on-surface-variant">
                          ({heroVendor.reviews})
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-space-grotesk-bold text-xl tracking-[-0.3px] text-ed-on-surface mb-1">
                    {heroVendor.business_name}
                  </Text>
                  <Text className="font-work-sans text-sm text-ed-on-surface-variant mb-4">
                    {heroVendor.location?.city}
                    {heroVendor.tagline ? ` · ${heroVendor.tagline}` : ''}
                  </Text>
                  <View className="flex-row items-center justify-between pt-4 border-t-2 border-ed-surface-container-high">
                    <Text className="font-space-grotesk-bold text-[15px] text-ed-primary-container">
                      {formatCompactCurrencyRange(heroVendor.price_min, heroVendor.price_max)}
                    </Text>
                    <View
                      className="flex-row items-center gap-1.5 bg-ed-primary-container px-3.5 py-2 rounded-lg"
                      style={shadowSoftSm}
                    >
                      <Text className="font-space-grotesk-bold text-xs text-white">
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
          <View className="px-5 mb-3.5">
            <View className="flex-row items-center justify-between">
              <Text className="font-space-grotesk-bold text-lg tracking-[-0.3px] text-ed-on-surface">
                {isSearching ? 'Search Results' : 'All Vendors'}
              </Text>
              <Text className="font-work-sans-bold text-xs text-ed-on-surface-variant">
                {listVendors.length} found
              </Text>
            </View>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/vendor/${item.id}`)}
          className="flex-row mx-5 mb-3 bg-ed-surface-container-lowest rounded-xl overflow-hidden border border-ed-outline-variant"
          style={shadowSoftSm}
        >
          {/* Thumbnail */}
          <View className="w-[110px] overflow-hidden">
            {item.cover_image ? (
              <Image
                source={{ uri: item.cover_image }}
                className="w-full h-full min-h-[120px]"
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={[editorial.secondaryContainer, editorial.tertiaryFixed]}
                style={{ width: '100%', minHeight: 120, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text className="text-[32px]">{EMOJI_MAP[item.id] ?? '🏛️'}</Text>
              </LinearGradient>
            )}
          </View>
          {/* Content */}
          <View className="flex-1 p-3.5 justify-center">
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <View className="bg-ed-tertiary-fixed px-1.5 py-0.5 rounded-[3px]">
                <Text className="font-work-sans-bold text-[9px] tracking-[1px] uppercase text-ed-tertiary-container">
                  {item.categoryLabel}
                </Text>
              </View>
              {item.rating != null && (
                <View className="flex-row items-center gap-0.5">
                  <Ionicons name="star" size={10} color="#C4920A" />
                  <Text className="font-space-grotesk-bold text-[11px] text-ed-on-surface">
                    {item.rating}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="font-space-grotesk-bold text-[15px] tracking-[-0.2px] text-ed-on-surface mb-1"
              numberOfLines={1}
            >
              {item.business_name}
            </Text>
            <Text
              className="font-work-sans text-xs text-ed-on-surface-variant mb-2"
              numberOfLines={1}
            >
              {item.location?.city}
              {item.tagline ? ` · ${item.tagline}` : ''}
            </Text>
            <Text className="font-space-grotesk-bold text-[13px] text-ed-primary-container">
              {formatCompactCurrencyRange(item.price_min, item.price_max)}
            </Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <View className="items-center py-10 px-5">
          <Ionicons name="search-outline" size={48} color={editorial.outlineVariant} />
          <Text className="font-playfair-bold text-lg text-ed-on-surface mt-4 text-center">
            No vendors found
          </Text>
          <Text className="font-work-sans text-sm text-ed-on-surface-variant mt-2 text-center">
            Try a different category or search term
          </Text>
        </View>
      }
    />
  );
}
