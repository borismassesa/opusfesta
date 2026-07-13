import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { BROWSE_CATEGORIES } from '@/constants/vendorCategories';
import type { SavedVendorRow } from '@/types/vendor';
import { useTheme } from '@/theme/useTheme';

interface BookedCategoryRowProps {
  category: (typeof BROWSE_CATEGORIES)[number];
  bookedRow: SavedVendorRow | undefined;
  onFindVendor: (categoryKey: string) => void;
}

export function BookedCategoryRow({ category, bookedRow, onFindVendor }: BookedCategoryRowProps) {
  const { editorial } = useTheme();
  const router = useRouter();
  const isBooked = !!bookedRow;

  return (
    <Pressable
      onPress={() =>
        isBooked ? router.push(`/vendor/${bookedRow.vendor_id}`) : onFindVendor(category.key)
      }
      className="flex-row items-center gap-3.5 px-5 py-4 border-b border-ed-outline-variant"
    >
      <View
        className={`w-14 h-14 rounded-full items-center justify-center border-ed-outline ${
          isBooked ? 'bg-ed-primary-container border-0 border-solid' : 'bg-transparent border-[1.5px] border-dashed'
        }`}
      >
        <Ionicons name={category.icon} size={22} color={isBooked ? '#fff' : editorial.onSurfaceVariant} />
        {isBooked && (
          <View className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-[10px] bg-white items-center justify-center">
            <Ionicons name="checkmark-circle" size={20} color="#2D8E5B" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-work-sans-bold text-[15px] text-ed-on-surface mb-0.5">
          {category.key}
        </Text>
        <Text
          className={`font-work-sans text-[13px] ${isBooked ? 'text-ed-on-surface-variant' : 'text-ed-outline'}`}
          numberOfLines={1}
        >
          {isBooked ? bookedRow.vendors?.business_name ?? 'Vendor' : 'Booked? Add them here'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={editorial.outline} />
    </Pressable>
  );
}
