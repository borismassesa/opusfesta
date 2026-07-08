import { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { BROWSE_CATEGORIES } from '@/constants/vendorCategories';
import { useSavedVendors } from '@/hooks/useSavedVendors';
import { useTheme } from '@/theme/useTheme';
import { BookedCategoryRow } from './BookedCategoryRow';

interface BookedVendorsTabProps {
  onFindVendor: (categoryKey: string) => void;
}

export function BookedVendorsTab({ onFindVendor }: BookedVendorsTabProps) {
  const { editorial } = useTheme();
  const { data: savedVendors = [], isLoading } = useSavedVendors();

  const bookedByCategory = useMemo(() => {
    const map: Record<string, any> = {};
    for (const row of savedVendors) {
      if (row.status !== 'booked') continue;
      const category = row.vendors?.category;
      if (!category || map[category]) continue;
      map[category] = row;
    }
    return map;
  }, [savedVendors]);

  const bookedCount = Object.keys(bookedByCategory).length;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={editorial.primaryContainer} />
      </View>
    );
  }

  return (
    <FlatList
      data={BROWSE_CATEGORIES}
      keyExtractor={(item) => item.key}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 14,
              backgroundColor: editorial.surfaceContainerHigh,
            }}
          >
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 14, color: editorial.onSurfaceVariant }}>
              {bookedCount} of {BROWSE_CATEGORIES.length} booked
            </Text>
          </View>
          <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant }}>
              When you mark vendors as booked, we'll add them to your budget for easy tracking.
            </Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <BookedCategoryRow category={item} bookedRow={bookedByCategory[item.key]} onFindVendor={onFindVendor} />
      )}
    />
  );
}
