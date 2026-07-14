import { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { BROWSE_CATEGORIES } from '@/constants/vendorCategories';
import { useSavedVendors } from '@/hooks/useSavedVendors';
import type { SavedVendorRow } from '@/types/vendor';
import { useTheme } from '@/theme/useTheme';
import { BookedCategoryRow } from './BookedCategoryRow';

interface BookedVendorsTabProps {
  onFindVendor: (categoryKey: string) => void;
}

export function BookedVendorsTab({ onFindVendor }: BookedVendorsTabProps) {
  const { editorial } = useTheme();
  const { data: savedVendors = [], isLoading } = useSavedVendors();

  const bookedByCategory = useMemo(() => {
    const map: Record<string, SavedVendorRow> = {};
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
      <View className="flex-1 items-center justify-center">
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
          <View className="px-5 py-3.5 bg-ed-surface-container-high">
            <Text className="font-work-sans-bold text-sm text-ed-on-surface-variant">
              {bookedCount} of {BROWSE_CATEGORIES.length} booked
            </Text>
          </View>
          <View className="px-5 py-4">
            <Text className="font-work-sans text-[13px] text-ed-on-surface-variant">
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
