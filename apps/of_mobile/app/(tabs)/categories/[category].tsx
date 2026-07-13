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
    <SafeAreaView className="flex-1 bg-ed-bg">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View className="flex-row items-center gap-3 flex-1">
          <Pressable onPress={() => router.back()} className="p-1">
            <Ionicons name="chevron-back" size={24} color={editorial.onSurface} />
          </Pressable>
          <Text
            className="font-playfair-bold text-[22px] text-ed-on-surface flex-1"
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/saved-vendors')}
          className="w-10 h-10 rounded-full items-center justify-center bg-ed-surface-container-lowest"
        >
          <Ionicons name="heart-outline" size={19} color={editorial.onSurface} />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : vendors.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center">
            No vendors found in this category yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <CategoryVendorCard
              id={item.id}
              name={item.business_name}
              location={item.location?.city}
              rating={item.stats?.averageRating ?? null}
              reviewCount={item.stats?.reviewCount ?? 0}
              priceMin={item.price_range?.min ?? null}
              priceMax={item.price_range?.max ?? null}
              images={item.gallery_urls?.length ? item.gallery_urls : item.cover_image ? [item.cover_image] : []}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
