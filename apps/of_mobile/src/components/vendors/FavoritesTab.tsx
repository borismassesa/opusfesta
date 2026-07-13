import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { VendorListItem } from '@/components/vendors/VendorListItem';
import { useSavedVendors } from '@/hooks/useSavedVendors';
import { useTheme } from '@/theme/useTheme';

export function FavoritesTab() {
  const { data: savedVendors = [], isLoading } = useSavedVendors();
  const { editorial } = useTheme();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={editorial.primaryContainer} />
      </View>
    );
  }

  if (savedVendors.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center">
          No saved vendors yet. Tap the heart on a vendor's profile to save it here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={savedVendors}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ gap: 10 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <VendorListItem
          id={item.vendors?.id ?? item.vendor_id}
          name={item.vendors?.business_name ?? 'Vendor'}
          category={item.vendors?.category ?? ''}
          location={item.vendors?.location?.city}
          rating={item.vendors?.stats?.averageRating ?? 0}
          logo={item.vendors?.logo}
        />
      )}
    />
  );
}
