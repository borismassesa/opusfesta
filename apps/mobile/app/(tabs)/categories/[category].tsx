import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryVendorCard } from '@/components/vendors/CategoryVendorCard';
import { getVendorsByCategory } from '@/lib/api/vendors';
import { VENDOR_CATEGORIES } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

export default function CategoryResultsScreen() {
  const { editorial } = useTheme();
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const label =
    VENDOR_CATEGORIES.find((c) => c.key === category)?.label ?? category;

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors', 'category', category],
    queryFn: () => getVendorsByCategory(category!),
    enabled: !!category,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: editorial.bg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="chevron-back" size={24} color={editorial.onSurface} />
          </Pressable>
          <Text
            style={{ fontFamily: 'PlayfairDisplay-Bold', fontSize: 22, color: editorial.onSurface, flex: 1 }}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/saved-vendors')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: editorial.surfaceContainerLowest,
          }}
        >
          <Ionicons name="heart-outline" size={19} color={editorial.onSurface} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : vendors.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurfaceVariant, textAlign: 'center' }}>
            No vendors found in this category yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }: any) => (
            <CategoryVendorCard
              id={item.id}
              name={item.business_name}
              location={item.location?.city}
              rating={item.stats?.averageRating ?? null}
              reviewCount={item.stats?.reviewCount ?? 0}
              priceMin={item.price_range?.min ?? null}
              priceMax={item.price_range?.max ?? null}
              images={item.gallery_urls?.length ? item.gallery_urls : [item.cover_image].filter(Boolean)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
