import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { BROWSE_CATEGORIES } from '@/constants/vendorCategories';
import { useTheme } from '@/theme/useTheme';

interface BookedCategoryRowProps {
  category: (typeof BROWSE_CATEGORIES)[number];
  bookedRow: any | undefined;
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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: editorial.outlineVariant,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isBooked ? editorial.primaryContainer : 'transparent',
          borderWidth: isBooked ? 0 : 1.5,
          borderStyle: isBooked ? 'solid' : 'dashed',
          borderColor: editorial.outline,
        }}
      >
        <Ionicons name={category.icon} size={22} color={isBooked ? '#fff' : editorial.onSurfaceVariant} />
        {isBooked && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#2D8E5B" />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 15, color: editorial.onSurface, marginBottom: 2 }}>
          {category.key}
        </Text>
        <Text
          style={{
            fontFamily: 'WorkSans-Regular',
            fontSize: 13,
            color: isBooked ? editorial.onSurfaceVariant : editorial.outline,
          }}
          numberOfLines={1}
        >
          {isBooked ? bookedRow.vendors?.business_name ?? 'Vendor' : 'Booked? Add them here'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={editorial.outline} />
    </Pressable>
  );
}
