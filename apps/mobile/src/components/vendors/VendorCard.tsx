import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { formatCurrency } from '@opusfesta/lib';
import { editorial, shadowSoft } from '@/constants/theme';

interface VendorCardProps {
  id: string;
  name: string;
  category: string;
  location?: string;
  rating?: number;
  ratingCount?: number;
  priceRange?: { min?: number; max?: number };
  coverImage?: string | null;
  logo?: string | null;
  compact?: boolean;
}

export function VendorCard({
  id,
  name,
  category,
  location,
  rating = 0,
  ratingCount = 0,
  priceRange,
  coverImage,
  compact = false,
}: VendorCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/vendor/${id}`)}
      style={[
        {
          backgroundColor: editorial.surfaceContainerLowest,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: editorial.outlineVariant,
          overflow: 'hidden',
          width: compact ? '100%' : 224,
        },
        shadowSoft,
      ]}
    >
      {coverImage ? (
        <Image
          source={{ uri: coverImage }}
          style={{ width: '100%', height: 144 }}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[editorial.secondaryContainer, editorial.tertiaryFixed]}
          style={{ width: '100%', height: 144, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 32 }}>📸</Text>
        </LinearGradient>
      )}

      <View style={{ padding: 14 }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 15,
            color: editorial.onSurface,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
        {location && (
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 12,
              color: editorial.onSurfaceVariant,
              marginTop: 4,
            }}
          >
            {location}
          </Text>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <StarRating rating={rating} count={ratingCount} />
          {priceRange?.min && (
            <Badge label={`From ${formatCurrency(priceRange.min)}`} />
          )}
        </View>
      </View>
    </Pressable>
  );
}
