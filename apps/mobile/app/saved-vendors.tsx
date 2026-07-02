import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { VendorListItem } from '@/components/vendors/VendorListItem';
import { useSavedVendors } from '@/hooks/useSavedVendors';
import { editorial } from '@/constants/theme';

export default function SavedVendorsScreen() {
  const { data: savedVendors = [], isLoading } = useSavedVendors();

  return (
    <ScreenWrapper scrollable={false}>
      <Header title="Saved vendors" showBack />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : savedVendors.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 14,
              color: editorial.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            No saved vendors yet. Tap the heart on a vendor's profile to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedVendors}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => (
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
      )}
    </ScreenWrapper>
  );
}
