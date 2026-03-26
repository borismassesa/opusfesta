import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { VendorListItem } from '@/components/vendors/VendorListItem';
import { getVendorsByCategory } from '@/lib/api/vendors';
import { VENDOR_CATEGORIES, brutalist } from '@/constants/theme';

export default function CategoryResultsScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const label =
    VENDOR_CATEGORIES.find((c) => c.key === category)?.label ?? category;

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors', 'category', category],
    queryFn: () => getVendorsByCategory(category!),
    enabled: !!category,
  });

  return (
    <ScreenWrapper scrollable={false}>
      <Header title={label} showBack />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={brutalist.primaryContainer} />
        </View>
      ) : vendors.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: brutalist.onSurfaceVariant }}>
            No vendors found in this category yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => (
            <VendorListItem
              id={item.id}
              name={item.business_name}
              category={item.category}
              location={item.location?.city}
              rating={item.stats?.rating_avg ?? 0}
              logo={item.logo}
              verified={item.verified}
            />
          )}
        />
      )}
    </ScreenWrapper>
  );
}
