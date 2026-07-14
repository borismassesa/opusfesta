import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { VendorCard } from '@/components/vendors/VendorCard';
import { useVendorSearch } from '@/hooks/useVendorSearch';
import { useTheme } from '@/theme/useTheme';

export default function SearchScreen() {
  const { editorial } = useTheme();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setQuery(input), 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data: results = [], isFetching } = useVendorSearch(query);
  const showEmpty = query.trim().length > 1 && !isFetching && results.length === 0;

  return (
    <ScreenWrapper scrollable={false}>
      <View className="flex-row items-center gap-2.5 mb-5">
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={22} color={editorial.primaryContainer} />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 bg-ed-surface-container-low rounded-3xl px-3.5 h-11">
          <Ionicons name="sparkles" size={16} color={editorial.tertiaryContainer} />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Search vendors"
            placeholderTextColor={editorial.onSurfaceVariant}
            autoFocus
            className="flex-1 font-work-sans text-sm text-ed-on-surface"
          />
          {input.length > 0 && (
            <Pressable onPress={() => setInput('')}>
              <Ionicons name="close-circle" size={18} color={editorial.outline} />
            </Pressable>
          )}
        </View>
      </View>

      {isFetching ? (
        <View className="pt-10 items-center">
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : showEmpty ? (
        <View className="pt-10 items-center px-8">
          <Ionicons name="search-outline" size={36} color={editorial.outlineVariant} />
          <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center mt-3">
            No vendors found for "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <VendorCard
              id={item.id}
              name={item.business_name}
              category={item.category}
              location={item.location?.city}
              rating={item.stats?.averageRating ?? 0}
              ratingCount={item.stats?.reviewCount ?? 0}
              priceRange={item.price_range}
              coverImage={item.cover_image}
              compact
            />
          )}
        />
      )}
    </ScreenWrapper>
  );
}
