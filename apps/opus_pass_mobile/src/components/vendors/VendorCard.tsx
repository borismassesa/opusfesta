import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { shortVendorLocation } from '@/lib/vendor-format';
import { StarRating } from './ui/StarRating';
import type { VendorListing } from '@/types/vendor';

/** `width` is for horizontal carousels; omit it to fill the parent in a grid. */
export function VendorCard({ vendor, width }: { vendor: VendorListing; width?: number }) {
  const router = useRouter();
  const { editorial } = useTheme();

  const image = vendor.cover_image || vendor.logo;
  const rating = vendor.stats?.averageRating ?? 0;
  const reviewCount = vendor.stats?.reviewCount ?? 0;
  const location = shortVendorLocation(vendor.location);

  return (
    <Pressable
      style={width === undefined ? undefined : { width }}
      className="overflow-hidden rounded-2xl border border-ed-outline-variant bg-ed-surface"
      onPress={() => router.push(`/vendor/${vendor.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`View ${vendor.business_name}`}
    >
      <View className="h-32 w-full bg-ed-surface-container">
        {image ? (
          <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="storefront-outline" size={26} color={editorial.onSurfaceVariant} />
          </View>
        )}
      </View>

      <View className="gap-1 px-3 py-2.5">
        <View className="flex-row items-center gap-1">
          <Text
            numberOfLines={1}
            className="flex-1 font-work-sans-bold text-sm text-ed-on-surface"
          >
            {vendor.business_name}
          </Text>
          {vendor.verified ? (
            <Ionicons name="checkmark-circle" size={14} color={editorial.secondary} />
          ) : null}
        </View>

        {location ? (
          <Text numberOfLines={1} className="font-work-sans text-xs text-ed-on-surface-variant">
            {location}
          </Text>
        ) : null}

        {reviewCount > 0 ? <StarRating rating={rating} count={reviewCount} /> : null}
      </View>
    </Pressable>
  );
}
