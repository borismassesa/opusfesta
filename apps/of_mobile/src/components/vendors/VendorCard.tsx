import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { formatCurrency } from '@opusfesta/lib';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import type { VendorPriceRange } from '@/types/vendor';

interface VendorCardProps {
  id: string;
  name: string;
  category: string;
  location?: string;
  rating?: number;
  ratingCount?: number;
  priceRange?: VendorPriceRange | null;
  coverImage?: string | null;
  logo?: string | null;
  compact?: boolean;
}

export function VendorCard({
  id,
  name,
  location,
  rating = 0,
  ratingCount = 0,
  priceRange,
  coverImage,
  compact = false,
}: VendorCardProps) {
  const { editorial } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/vendor/${id}`)}
      className={`bg-ed-surface-container-lowest rounded-[24px] border border-ed-outline-variant overflow-hidden ${compact ? 'w-full' : 'w-[224px]'}`}
      style={shadowSoft}
    >
      {coverImage ? (
        <Image
          source={{ uri: coverImage }}
          className="w-full h-36"
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[editorial.secondaryContainer, editorial.tertiaryFixed]}
          style={{ width: '100%', height: 144, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text className="text-[32px]">📸</Text>
        </LinearGradient>
      )}

      <View className="p-3.5">
        <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface" numberOfLines={1}>
          {name}
        </Text>
        {location && (
          <Text className="font-work-sans text-xs text-ed-on-surface-variant mt-1">
            {location}
          </Text>
        )}
        <View className="flex-row justify-between items-center mt-2">
          <StarRating rating={rating} count={ratingCount} />
          {priceRange?.min && (
            <Badge label={`From ${formatCurrency(priceRange.min)}`} />
          )}
        </View>
      </View>
    </Pressable>
  );
}
