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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color={editorial.primaryContainer} />
        </Pressable>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: editorial.surfaceContainerLow,
            borderRadius: 24,
            paddingHorizontal: 14,
            height: 44,
          }}
        >
          <Ionicons name="sparkles" size={16} color={editorial.tertiaryContainer} />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Search vendors"
            placeholderTextColor={editorial.onSurfaceVariant}
            autoFocus
            style={{ flex: 1, fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurface }}
          />
          {input.length > 0 && (
            <Pressable onPress={() => setInput('')}>
              <Ionicons name="close-circle" size={18} color={editorial.outline} />
            </Pressable>
          )}
        </View>
      </View>

      {isFetching ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : showEmpty ? (
        <View style={{ paddingTop: 40, alignItems: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="search-outline" size={36} color={editorial.outlineVariant} />
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 14,
              color: editorial.onSurfaceVariant,
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            No vendors found for "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => (
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
